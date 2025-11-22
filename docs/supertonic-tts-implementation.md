# Supertonic TTS Implementation Guide

**Date:** 2025-11-22
**Project:** DC Solo RPG
**Implementation:** Browser-based neural TTS using ONNX Runtime Web

## Table of Contents

1. [Overview](#overview)
2. [Implementation History](#implementation-history)
3. [Browser Implementation (Final Solution)](#browser-implementation-final-solution)
4. [Node.js Implementation (Failed Attempt)](#nodejs-implementation-failed-attempt)
5. [Architecture Details](#architecture-details)
6. [Deployment Strategy](#deployment-strategy)
7. [Performance & Optimization](#performance--optimization)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Future Improvements](#future-improvements)

---

## Overview

Supertonic is a lightweight, on-device neural TTS system developed by Supertone Inc. It uses ONNX models (~265MB) for high-quality speech synthesis with minimal computational overhead.

**Key Features:**
- 66M parameters (lightweight for neural TTS)
- 167× faster than real-time on M4 Pro
- Complete on-device processing (no API calls, no privacy concerns)
- Four voice presets (F1, F2, M1, M2)
- MIT licensed sample code, OpenRAIL-M licensed models

**Resources:**
- GitHub: https://github.com/supertone-inc/supertonic
- Hugging Face: https://huggingface.co/Supertone/supertonic
- Demo: https://huggingface.co/spaces/Supertone/supertonic

---

## Implementation History

### Timeline

**2025-11-21: Initial Node.js Attempt**
- Installed `onnxruntime-node` for server-side TTS
- Created SvelteKit server endpoint at `/server/tts/supertonic`
- Hit Azure SWA build errors due to native `.node` modules

**2025-11-21: Pivot to Browser Implementation**
- Switched to `onnxruntime-web` (WASM-based)
- Ported Supertonic's web helper code from GitHub
- Implemented browser-based provider

**2025-11-21: Deployment Challenges**
- Azure SWA 250MB limit exceeded (252MB of models + 29MB build = 281MB)
- Attempted Git LFS solution (failed - still counted against limit)
- **Solution:** Host models on Hugging Face CDN, WASM on jsDelivr CDN

**2025-11-22: Final Configuration**
- Configured ONNX Runtime Web to fetch WASM from jsDelivr
- Updated availability checks to verify Hugging Face access
- Removed old server endpoint references
- Deployment size: 29MB ✅

---

## Browser Implementation (Final Solution)

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   User's Browser                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  SupertonicTTSProvider.js                                    │
│  ├─ Text Processing (UnicodeProcessor)                       │
│  ├─ Style Management (F1, F2, M1, M2)                        │
│  └─ TTS Inference (TextToSpeech)                             │
│      ├─ Duration Predictor                                   │
│      ├─ Text Encoder                                         │
│      ├─ Vector Estimator (5-step diffusion)                  │
│      └─ Vocoder (waveform generation)                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
         ↓                                    ↓
┌──────────────────────┐          ┌─────────────────────────┐
│  Hugging Face CDN    │          │    jsDelivr CDN         │
│  (~265MB)            │          │    (~60MB)              │
├──────────────────────┤          ├─────────────────────────┤
│ • ONNX Models        │          │ • WASM Runtime Files    │
│ • Voice Styles       │          │   ort-wasm-*.wasm       │
│ • Config Files       │          │   ort-wasm-*.mjs        │
└──────────────────────┘          └─────────────────────────┘
```

### Key Files

#### `src/lib/services/tts/providers/SupertonicTTSProvider.js`

Main provider implementation (~530 lines):

```javascript
import * as ort from 'onnxruntime-web';

// CRITICAL: Configure WASM paths before any ONNX operations
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/';

export class SupertonicTTSProvider extends BaseTTSProvider {
  constructor() {
    super();
    this.config = {
      speed: 1.05,
      maxChunkLength: 300,
      silenceDuration: 0.3,
      totalStep: 5, // Diffusion denoising steps
      assetsPath: 'https://huggingface.co/Supertone/supertonic/resolve/main'
    };
  }

  async _loadModels() {
    // 1. Load configuration
    const cfgsResponse = await fetch(`${assetsPath}/onnx/tts.json`);
    const cfgs = await cfgsResponse.json();

    // 2. Load unicode indexer (character → ID mapping)
    const indexerResponse = await fetch(`${assetsPath}/onnx/unicode_indexer.json`);
    const indexer = await indexerResponse.json();
    this.textProcessor = new UnicodeProcessor(indexer);

    // 3. Load ONNX models (parallel loading for speed)
    const sessionOptions = {
      executionProviders: ['webgpu', 'wasm'] // Try WebGPU first, fallback to WASM
    };

    const [dpOrt, textEncOrt, vectorEstOrt, vocoderOrt] = await Promise.all([
      ort.InferenceSession.create(`${assetsPath}/onnx/duration_predictor.onnx`, sessionOptions),
      ort.InferenceSession.create(`${assetsPath}/onnx/text_encoder.onnx`, sessionOptions),
      ort.InferenceSession.create(`${assetsPath}/onnx/vector_estimator.onnx`, sessionOptions),
      ort.InferenceSession.create(`${assetsPath}/onnx/vocoder.onnx`, sessionOptions)
    ]);

    // 4. Load voice style embeddings
    for (const voiceId of ['F1', 'F2', 'M1', 'M2']) {
      const styleResponse = await fetch(`${assetsPath}/voice_styles/${voiceId}.json`);
      const styleData = await styleResponse.json();

      // Convert to ONNX tensors
      const ttlTensor = new ort.Tensor('float32',
        new Float32Array(styleData.style_ttl.data.flat(2)),
        [1, 50, 256]
      );
      const dpTensor = new ort.Tensor('float32',
        new Float32Array(styleData.style_dp.data.flat(2)),
        [1, 8, 16]
      );

      this.styles[voiceId] = new Style(ttlTensor, dpTensor);
    }
  }
}
```

### Component Classes

#### 1. **UnicodeProcessor**

Converts text to token IDs for the text encoder.

```javascript
class UnicodeProcessor {
  constructor(indexer) {
    this.indexer = indexer; // Array mapping Unicode code points → token IDs
  }

  call(textList) {
    // 1. Normalize text (NFKC)
    const processedTexts = textList.map(text => text.normalize('NFKC'));

    // 2. Convert to token IDs
    const textIds = processedTexts.map(text => {
      const row = [];
      for (let j = 0; j < text.length; j++) {
        const codePoint = text.codePointAt(j);
        row[j] = codePoint < this.indexer.length ? this.indexer[codePoint] : -1;
      }
      return row;
    });

    // 3. Create attention mask
    const textMask = this.getTextMask(textIdsLengths);

    return { textIds, textMask };
  }
}
```

**Key Points:**
- Uses NFKC Unicode normalization
- Handles out-of-vocabulary characters with -1
- Pads sequences to max length in batch
- Creates attention masks for variable-length inputs

#### 2. **Style**

Voice embedding container.

```javascript
class Style {
  constructor(ttlTensor, dpTensor) {
    this.ttl = ttlTensor; // Text-to-latent style embedding [1, 50, 256]
    this.dp = dpTensor;   // Duration predictor style embedding [1, 8, 16]
  }
}
```

**Voice Files:**
- `F1.json` - Female Voice 1 (421 KB)
- `F2.json` - Female Voice 2 (421 KB)
- `M1.json` - Male Voice 1 (421 KB)
- `M2.json` - Male Voice 2 (421 KB)

Each file contains:
```json
{
  "style_ttl": {
    "data": [[[ /* 50×256 float32 array */ ]]]
  },
  "style_dp": {
    "data": [[[ /* 8×16 float32 array */ ]]]
  }
}
```

#### 3. **TextToSpeech**

Main inference engine implementing the TTS pipeline.

```javascript
class TextToSpeech {
  async _infer(textList, style, totalStep, speed = 1.05) {
    // STEP 1: Text → Token IDs
    const { textIds, textMask } = this.textProcessor.call(textList);

    // STEP 2: Predict Duration
    const dpOutputs = await this.dpOrt.run({
      text_ids: textIdsTensor,
      style_dp: style.dp,
      text_mask: textMaskTensor
    });
    const duration = dpOutputs.duration.data.map(d => d / speed);

    // STEP 3: Text Encoding
    const textEncOutputs = await this.textEncOrt.run({
      text_ids: textIdsTensor,
      duration: durationTensor
    });
    const textEmb = textEncOutputs.text_emb;

    // STEP 4: Sample Noisy Latent (Gaussian noise)
    const { xt, latentMask } = this.sampleNoisyLatent(
      duration,
      this.sampleRate,
      this.cfgs.ae.base_chunk_size,
      this.cfgs.ttl.chunk_compress_factor,
      this.cfgs.ttl.latent_dim
    );

    // STEP 5: Diffusion Denoising (5 steps)
    let xtTensor = new ort.Tensor('float32', xt.flat(2), [bsz, latentDim, latentLen]);

    for (let step = 0; step < totalStep; step++) {
      const vectorEstOutputs = await this.vectorEstOrt.run({
        noisy_latent: xtTensor,
        text_emb: textEmb,
        style_ttl: style.ttl,
        timestep: timestepTensor,
        latent_mask: latentMaskTensor
      });

      // Denoise: x_t → x_{t-1}
      const predX0 = vectorEstOutputs.pred_x0.data;
      xtTensor = this.updateLatent(xtTensor, predX0, step, totalStep);
    }

    // STEP 6: Vocoder (latent → waveform)
    const vocoderOutputs = await this.vocoderOrt.run({
      latent: xtTensor
    });

    return {
      wav: Array.from(vocoderOutputs.wav_tts.data),
      duration: duration
    };
  }
}
```

**Inference Pipeline:**

```
Input Text
    ↓
┌───────────────────────┐
│ 1. Text Processing    │
│    UnicodeProcessor   │
│    "Hello" → [72,101,108,108,111]
└───────────────────────┘
    ↓
┌───────────────────────┐
│ 2. Duration Prediction│
│    duration_predictor.onnx (1.6MB)
│    Predicts phoneme durations
└───────────────────────┘
    ↓
┌───────────────────────┐
│ 3. Text Encoding      │
│    text_encoder.onnx (27MB)
│    Text → embeddings
└───────────────────────┘
    ↓
┌───────────────────────┐
│ 4. Sample Noise       │
│    Gaussian noise     │
│    Box-Muller transform
└───────────────────────┘
    ↓
┌───────────────────────┐
│ 5. Denoising (×5)     │
│    vector_estimator.onnx (127MB)
│    x_T → x_0 (diffusion)
└───────────────────────┘
    ↓
┌───────────────────────┐
│ 6. Vocoder            │
│    vocoder.onnx (97MB)│
│    Latent → waveform  │
└───────────────────────┘
    ↓
Audio Waveform (24kHz)
```

### ONNX Model Files

Hosted on Hugging Face: `https://huggingface.co/Supertone/supertonic/resolve/main/onnx/`

| File | Size | Purpose |
|------|------|---------|
| `tts.json` | 8.65 KB | Configuration (sample rate, dimensions, etc.) |
| `unicode_indexer.json` | 262 KB | Unicode → token ID mapping |
| `duration_predictor.onnx` | 1.6 MB | Predicts phoneme durations |
| `text_encoder.onnx` | 27 MB | Converts text tokens to embeddings |
| `vector_estimator.onnx` | 127 MB | Diffusion denoising model |
| `vocoder.onnx` | 97 MB | Converts latents to audio waveform |
| **Total** | **~253 MB** | |

### ONNX Runtime Web Configuration

**Critical Configuration:**

```javascript
// MUST be set BEFORE creating any InferenceSession
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/';
```

**WASM Files Loaded from CDN:**

| File | Size | Purpose |
|------|------|---------|
| `ort-wasm-simd-threaded.wasm` | 12 MB | Main WASM runtime (SIMD + threads) |
| `ort-wasm-simd-threaded.jsep.wasm` | 23 MB | WebGPU-enabled runtime |
| `ort-wasm-simd-threaded.asyncify.wasm` | 25 MB | Async-enabled runtime |
| **Total** | **~60 MB** | (browser only downloads what it needs) |

**Execution Providers:**

```javascript
const sessionOptions = {
  executionProviders: ['webgpu', 'wasm']
};
```

1. **WebGPU** (preferred): GPU acceleration on supported browsers
2. **WASM** (fallback): CPU-based inference using WebAssembly

### UI Integration

#### `src/lib/components/settings/TTSSection.svelte`

```svelte
<script>
  async function checkSupertonicAvailability() {
    try {
      // Check if ONNX models are available from Hugging Face CDN
      const response = await fetch(
        'https://huggingface.co/Supertone/supertonic/resolve/main/onnx/tts.json'
      );
      providerAvailability.supertonic = response.ok;
    } catch (error) {
      providerAvailability.supertonic = false;
    }
  }
</script>

<select bind:value={ttsProvider}>
  <option value="browser">Browser (Free, No API Key)</option>
  <option value="supertonic" disabled={!providerAvailability.supertonic}>
    Supertonic Neural TTS {providerAvailability.supertonic
      ? '(Free, Downloads from HF)'
      : '(HF Unavailable)'}
  </option>
</select>

{#if ttsProvider === 'supertonic'}
  <div class="info-box">
    <p>
      <strong>Note:</strong> Supertonic loads neural TTS models (~265MB) from
      Hugging Face CDN, then processes speech on your device using ONNX Runtime
      Web (WASM/WebGPU). First use downloads models; subsequent uses are instant.
      No API key required and no data sent to servers.
    </p>
  </div>
{/if}
```

#### `src/lib/components/settings/AudioSettings.svelte`

Same availability check - ensure both components are synchronized.

---

## Node.js Implementation (Failed Attempt)

### Why We Tried Node.js

Initially attempted server-side TTS to:
- Offload computation from client
- Centralize model loading
- Avoid CORS issues

### Implementation

```javascript
// src/routes/server/tts/supertonic/+server.js
import * as ort from 'onnxruntime-node';

export async function POST({ request }) {
  const { text, voice, speed } = await request.json();

  // Load models from local filesystem
  const dpSession = await ort.InferenceSession.create('./models/duration_predictor.onnx');
  // ... etc

  // Run inference
  const audioBuffer = await synthesize(text, voice, speed);

  return new Response(audioBuffer, {
    headers: { 'Content-Type': 'audio/wav' }
  });
}
```

### Why It Failed

#### Problem 1: Native Modules in esbuild

**Error:**
```
✘ [ERROR] No loader is configured for ".node" files:
node_modules/onnxruntime-node/bin/napi-v6/linux-x64/onnxruntime_binding.node
```

**Root Cause:**
- `onnxruntime-node` uses native C++ bindings (`.node` files)
- Azure SWA adapter uses esbuild for bundling
- esbuild cannot bundle native modules
- Static imports (`import * as ort from 'onnxruntime-node'`) cause esbuild to analyze the module during build

**Attempted Fixes (All Failed):**

1. **Mark as external:**
```javascript
// svelte.config.js
adapter: adapter({
  esbuild: {
    external: ['onnxruntime-node']
  }
})
```
❌ esbuild still tried to analyze the import

2. **Add .node loader:**
```javascript
esbuild: {
  loader: { '.node': 'empty' }
}
```
❌ Loader runs too late; esbuild already failed during analysis

3. **esbuild plugin:**
```javascript
plugins: [{
  name: 'onnx-runtime-external',
  setup(build) {
    build.onResolve({ filter: /^onnxruntime-node$/ }, () => ({
      path: 'onnxruntime-node',
      external: true
    }));
  }
}]
```
❌ Plugin runs after module graph analysis

**Why These Failed:**
esbuild's bundling phase has three stages:
1. **Resolve** - Find module paths
2. **Load** - Read file contents
3. **Transform** - Parse and bundle

Static imports trigger all three stages immediately. Native `.node` files fail during **Load** before any plugin/external configuration takes effect.

#### Problem 2: Azure SWA Deployment Size

Even if we could bundle `onnxruntime-node`:
- 252 MB of ONNX models
- ~29 MB of build output
- **Total: 281 MB** > Azure SWA 250 MB limit

**Git LFS Attempt:**
```yaml
- uses: actions/checkout@v3
  with:
    lfs: true
```

❌ Git LFS files still count against deployment size limit. Azure SWA measures total deployed file size, not Git repository size.

### Lessons Learned

**✅ DO:**
- Use browser-based WASM libraries for SvelteKit apps deployed to Azure SWA
- Host large assets (models, data) on CDN
- Test full deployment pipeline early

**❌ DON'T:**
- Use native Node.js modules with esbuild-based adapters
- Bundle large files in deployments with strict size limits
- Assume Git LFS will bypass deployment size checks

---

## Deployment Strategy

### CDN Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Azure Static Web Apps (29 MB)                 │
│  ┌────────────────────────────────────────────────┐     │
│  │  SvelteKit Application                         │     │
│  │  • HTML, CSS, JS                               │     │
│  │  • SupertonicTTSProvider.js                    │     │
│  │  • UI Components                               │     │
│  └────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
              ↓                              ↓
    ┌──────────────────┐          ┌──────────────────────┐
    │  Hugging Face    │          │  jsDelivr CDN        │
    │  (~265 MB)       │          │  (~60 MB)            │
    │                  │          │                      │
    │  ONNX Models:    │          │  WASM Files:         │
    │  • duration_     │          │  • ort-wasm-simd-    │
    │    predictor     │          │    threaded.wasm     │
    │  • text_encoder  │          │  • ort-wasm-simd-    │
    │  • vector_       │          │    threaded.jsep.wasm│
    │    estimator     │          │  • ort-wasm-simd-    │
    │  • vocoder       │          │    threaded.asyncify │
    │                  │          │    .wasm             │
    │  Voice Styles:   │          │  • ort-wasm-*.mjs    │
    │  • F1, F2        │          │                      │
    │  • M1, M2        │          │                      │
    │                  │          │                      │
    │  Config:         │          │                      │
    │  • tts.json      │          │                      │
    │  • unicode_      │          │                      │
    │    indexer.json  │          │                      │
    └──────────────────┘          └──────────────────────┘
```

### Why This Works

1. **Azure SWA only stores the app (29 MB)** - well under 250 MB limit
2. **Models loaded on-demand from Hugging Face** - only downloaded once per user
3. **WASM runtime from jsDelivr** - cached by CDN
4. **Browser caches everything** - subsequent visits are instant

### GitHub Actions Workflow

```yaml
# .github/workflows/azure-static-web-apps-yellow-moss-0be668010.yml
name: Publish Prod CI/CD

on:
  push:
    branches: [main]

jobs:
  build_and_deploy_job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      # No LFS needed - models are on CDN

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: 'upload'
          app_location: '/'
          api_location: 'build/server'
          output_location: 'build/static'
```

**Build Time:** ~2-3 minutes
**Deployment Size:** ~29 MB
**Status:** ✅ Success

### CDN URLs

**Hugging Face:**
- Base URL: `https://huggingface.co/Supertone/supertonic/resolve/main`
- Models: `${baseUrl}/onnx/*.onnx`
- Voices: `${baseUrl}/voice_styles/*.json`
- Config: `${baseUrl}/onnx/tts.json`

**jsDelivr:**
- WASM: `https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/`
- Files: `ort-wasm-simd-threaded*.wasm`, `ort-wasm-simd-threaded*.mjs`

---

## Architecture Details

### Text Chunking

Long text is split into manageable chunks:

```javascript
_chunkText(text, maxLen = 300) {
  // 1. Split by paragraph
  const paragraphs = text.trim().split(/\n\s*\n+/).filter(p => p.trim());

  // 2. Split by sentence (with abbreviation handling)
  const sentences = paragraph.split(
    /(?<!Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.|Sr\.|Jr\.|Ph\.D\.|etc\.|e\.g\.|i\.e\.|vs\.)(?<!\b[A-Z]\.)(?<=[.!?])\s+/
  );

  // 3. Combine sentences into chunks ≤ maxLen
  let currentChunk = '';
  for (let sentence of sentences) {
    if (currentChunk.length + sentence.length + 1 <= maxLen) {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }

  return chunks;
}
```

**Why 300 characters?**
- Balance between quality and memory
- Prevents ONNX tensor size explosions
- Maintains sentence coherence

### Gaussian Noise Sampling

Box-Muller transform for diffusion initialization:

```javascript
sampleNoisyLatent(duration, sampleRate, baseChunkSize, chunkCompress, latentDim) {
  const xt = [];

  for (let b = 0; b < bsz; b++) {
    for (let d = 0; d < latentDimVal; d++) {
      const row = [];
      for (let t = 0; t < latentLen; t++) {
        // Box-Muller transform: uniform → Gaussian
        const u1 = Math.max(0.0001, Math.random());
        const u2 = Math.random();
        const val = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        row.push(val);
      }
      batch.push(row);
    }
    xt.push(batch);
  }

  // Apply latent mask (zero out padding)
  for (let b = 0; b < bsz; b++) {
    for (let d = 0; d < latentDimVal; d++) {
      for (let t = 0; t < latentLen; t++) {
        xt[b][d][t] *= latentMask[b][0][t];
      }
    }
  }

  return { xt, latentMask };
}
```

**Why Box-Muller?**
- Converts `Math.random()` (uniform [0,1]) to Gaussian N(0,1)
- Required for diffusion model initialization
- Standard technique in generative models

### Diffusion Denoising

5-step iterative denoising:

```javascript
for (let step = 0; step < 5; step++) {
  // Calculate timestep (1000 → 0)
  const t = 1000 - (step * 1000 / totalStep);

  // Run vector estimator
  const vectorEstOutputs = await this.vectorEstOrt.run({
    noisy_latent: xtTensor,      // Current noisy latent
    text_emb: textEmb,            // Text conditioning
    style_ttl: style.ttl,         // Voice style
    timestep: new ort.Tensor('float32', [t], [1]),
    latent_mask: latentMaskTensor
  });

  // Get predicted clean latent
  const predX0 = vectorEstOutputs.pred_x0.data;

  // Update: x_t → x_{t-1}
  xtTensor = this.updateLatent(xtTensor, predX0, step, totalStep);
}
```

**Why 5 steps?**
- Balance between quality and speed
- More steps = higher quality but slower
- 5 steps achieves ~167× real-time on M4 Pro

### Audio Playback

Web Audio API integration:

```javascript
async speak(text, options = {}) {
  // 1. Synthesize audio
  const { wav, duration } = await this.ttsInstance.infer(
    [text],
    this.styles[this.currentVoice],
    this.config.totalStep,
    this.config.speed
  );

  // 2. Create AudioBuffer
  const audioBuffer = this.audioContext.createBuffer(
    1,                    // mono
    wav.length,           // length in samples
    this.sampleRate       // 24000 Hz
  );

  const channelData = audioBuffer.getChannelData(0);
  for (let i = 0; i < wav.length; i++) {
    channelData[i] = wav[i];
  }

  // 3. Play audio
  const source = this.audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(this.audioContext.destination);
  source.start(0);

  // 4. Track playback state
  this.isPlaying = true;
  source.onended = () => {
    this.isPlaying = false;
  };
}
```

**Sample Rate:** 24 kHz (configured in `tts.json`)

---

## Performance & Optimization

### Loading Times

**First Load (Cold Start):**
```
1. WASM files from jsDelivr     ~3-5 seconds   (~60 MB)
2. ONNX models from HF          ~20-40 seconds (~265 MB)
3. Voice styles from HF         ~2-3 seconds   (~1.7 MB)
Total:                          ~25-48 seconds
```

**Subsequent Loads:**
```
1. Check browser cache          <100 ms (cache hit)
2. Initialize ONNX sessions     ~2-3 seconds
Total:                          ~2-3 seconds
```

### Inference Speed

**On M4 Pro (Supertone benchmarks):**
- Real-time factor: 167× (167 seconds of audio per 1 second of processing)
- Typical sentence: ~50 ms processing time

**On Consumer Hardware (estimated):**
- Desktop (WebGPU): 50-100× real-time
- Desktop (WASM): 20-50× real-time
- Mobile (high-end): 10-20× real-time
- Mobile (low-end): 5-10× real-time

### Memory Usage

**Peak Memory (during inference):**
- ONNX models in memory: ~350 MB
- Intermediate tensors: ~100 MB
- Audio buffer: ~2 MB per sentence
- **Total: ~450-500 MB**

**Idle Memory:**
- Cached models: ~350 MB
- Provider instance: ~1 MB
- **Total: ~351 MB**

### Optimization Strategies

1. **Parallel Model Loading:**
```javascript
const [dp, textEnc, vectorEst, vocoder] = await Promise.all([
  ort.InferenceSession.create('duration_predictor.onnx'),
  ort.InferenceSession.create('text_encoder.onnx'),
  ort.InferenceSession.create('vector_estimator.onnx'),
  ort.InferenceSession.create('vocoder.onnx')
]);
```

2. **Text Chunking:**
```javascript
// Avoid processing entire documents at once
const chunks = this._chunkText(longText, 300);
for (const chunk of chunks) {
  const { wav } = await this._infer([chunk], style, totalStep, speed);
  wavCat = [...wavCat, ...silence, ...wav];
}
```

3. **WebGPU Acceleration:**
```javascript
const sessionOptions = {
  executionProviders: ['webgpu', 'wasm'] // Try GPU first
};
```

4. **Browser Caching:**
- ONNX models cached by browser (HTTP 200 with cache headers)
- WASM files cached by jsDelivr CDN
- No cache expiration needed (versioned URLs)

---

## Troubleshooting Guide

### Issue 1: "no available backend found"

**Error:**
```
Failed to initialize Supertonic TTS: no available backend found.
ERR: [webgpu] RuntimeError: Aborted(both async and sync fetching of the wasm failed).
Build with -sASSERTIONS for more info., [wasm] Error: previous call to 'initWasm()' failed.
```

**Cause:** ONNX Runtime Web cannot find its WASM files.

**Solution:**
```javascript
// MUST be set BEFORE creating any InferenceSession
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/';
```

**Verification:**
1. Open DevTools → Network tab
2. Look for `ort-wasm-simd-threaded.wasm` loading from jsDelivr
3. Should see HTTP 200 status

### Issue 2: Supertonic Option Disabled

**Symptom:** Supertonic shows as "(HF Unavailable)" in settings.

**Cause:** Availability check failing to reach Hugging Face.

**Solution:**
1. Check if `https://huggingface.co/Supertone/supertonic/resolve/main/onnx/tts.json` is accessible
2. Verify no CORS issues (should have `access-control-allow-origin: *`)
3. Check browser console for network errors

**Code to verify:**
```javascript
async function checkSupertonicAvailability() {
  try {
    const response = await fetch(
      'https://huggingface.co/Supertone/supertonic/resolve/main/onnx/tts.json'
    );
    console.log('Supertonic availability:', response.ok);
  } catch (error) {
    console.error('Supertonic check failed:', error);
  }
}
```

### Issue 3: Old Server Endpoint Error

**Error:** `404 GET /server/tts/supertonic`

**Cause:** Code still referencing deleted server endpoint.

**Solution:**
1. Search for `/server/tts/supertonic` in codebase
2. Replace with Hugging Face availability check
3. Remove any disabled server files (`+server.js.disabled`)

**Files to check:**
- `src/lib/components/settings/AudioSettings.svelte`
- `src/lib/components/settings/TTSSection.svelte`

### Issue 4: Models Not Loading

**Error:** `Failed to fetch https://huggingface.co/.../*.onnx`

**Possible Causes:**
1. **Network connectivity** - Hugging Face is down or blocked
2. **CORS issues** - Browser blocking cross-origin requests
3. **Timeout** - Models are large (127 MB for vector_estimator)

**Solutions:**
1. Increase fetch timeout (if using custom fetch wrapper)
2. Check browser console for CORS errors
3. Try different network (VPN, mobile hotspot)
4. Verify Hugging Face status: https://status.huggingface.co/

### Issue 5: Azure SWA Build Fails

**Error:** `The size of the app content was too large. The limit is 262144000 bytes.`

**Cause:** Deployment exceeds 250 MB limit.

**Solution:**
1. Verify ONNX models are NOT in `static/` directory
2. Verify Git LFS is NOT enabled (we don't use it)
3. Check build output size: `du -sh .svelte-kit/output/`
4. Should be ~29 MB, not >250 MB

**Verification:**
```bash
# Check for large files in build output
find .svelte-kit/output -type f -size +10M -exec ls -lh {} \;

# Should NOT see any .onnx or .wasm files
```

### Issue 6: esbuild .node File Errors

**Error:** `No loader is configured for ".node" files`

**Cause:** Native modules in server code.

**Solution:** Use browser implementation instead of Node.js implementation.

**DO NOT:**
```javascript
import * as ort from 'onnxruntime-node'; // ❌ Native modules
```

**DO:**
```javascript
import * as ort from 'onnxruntime-web'; // ✅ WASM-based
```

---

## Future Improvements

### 1. Model Quantization

**Current:** FP32 models (~265 MB)

**Potential:** INT8 quantization could reduce to ~66 MB (4× smaller)

```javascript
// Future: Load quantized models
const sessionOptions = {
  executionProviders: ['webgpu', 'wasm'],
  graphOptimizationLevel: 'all',
  enableQuantization: true
};
```

**Trade-offs:**
- ✅ 75% size reduction
- ✅ Faster download
- ✅ Less memory
- ⚠️ Slight quality loss (usually imperceptible)

### 2. Streaming Inference

**Current:** Full text → full audio (batch processing)

**Potential:** Stream audio as it's generated (chunk-by-chunk)

```javascript
async *speakStreaming(text) {
  const chunks = this._chunkText(text, 300);

  for (const chunk of chunks) {
    const { wav } = await this._infer([chunk], style, totalStep, speed);
    yield new Float32Array(wav); // Stream audio chunks
  }
}
```

**Benefits:**
- ✅ Lower latency (hear first words immediately)
- ✅ Better UX for long text
- ✅ Lower memory usage

### 3. WebGPU Optimization

**Current:** WebGPU as fallback

**Potential:** Optimize for WebGPU-first execution

```javascript
// Detect WebGPU support
const hasWebGPU = 'gpu' in navigator;

const sessionOptions = {
  executionProviders: hasWebGPU
    ? ['webgpu']           // GPU-only if supported
    : ['wasm']             // WASM-only fallback
};
```

**Benefits:**
- ✅ 2-5× faster inference on compatible GPUs
- ✅ Lower CPU usage
- ⚠️ Requires WebGPU-enabled browser

### 4. Service Worker Caching

**Current:** Browser HTTP cache

**Potential:** Explicit Service Worker cache control

```javascript
// service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('supertonic-v1').then((cache) => {
      return cache.addAll([
        'https://huggingface.co/Supertone/supertonic/resolve/main/onnx/tts.json',
        // Pre-cache critical files
      ]);
    })
  );
});
```

**Benefits:**
- ✅ Offline support
- ✅ Guaranteed cache hits
- ✅ Faster subsequent loads

### 5. Voice Customization

**Current:** 4 preset voices (F1, F2, M1, M2)

**Potential:** Allow custom voice embeddings

```javascript
async loadCustomVoice(voiceEmbedding) {
  const ttlTensor = new ort.Tensor('float32', voiceEmbedding.ttl, [1, 50, 256]);
  const dpTensor = new ort.Tensor('float32', voiceEmbedding.dp, [1, 8, 16]);

  this.styles['custom'] = new Style(ttlTensor, dpTensor);
}
```

**Benefits:**
- ✅ Unlimited voice variety
- ✅ User-uploaded voice profiles
- ⚠️ Requires voice extraction tool

### 6. Multi-language Support

**Current:** English only

**Potential:** Load language-specific models from Hugging Face

```javascript
const assetsPath = `https://huggingface.co/Supertone/supertonic-${language}/resolve/main`;
```

**Requirements:**
- Supertone would need to release non-English models
- Each language adds ~265 MB
- Unicode indexer needs language-specific mappings

---

## Appendix

### File Structure

```
src/lib/services/tts/
├── BaseTTSProvider.js           # Abstract base class
└── providers/
    ├── BrowserTTSProvider.js    # Browser Speech Synthesis API
    ├── OpenAITTSProvider.js     # OpenAI TTS API
    ├── ElevenLabsTTSProvider.js # ElevenLabs TTS API
    └── SupertonicTTSProvider.js # Supertonic ONNX (this doc)
        ├── UnicodeProcessor      # Text → token IDs
        ├── Style                 # Voice embeddings
        └── TextToSpeech          # Inference pipeline

src/lib/components/settings/
├── AudioSettings.svelte          # Main settings component
└── TTSSection.svelte            # TTS-specific settings

.references/
└── supertonic-tts-implementation.md (this file)
```

### Key Dependencies

```json
{
  "dependencies": {
    "onnxruntime-web": "^1.23.2"
  }
}
```

**Why onnxruntime-web:**
- ✅ WASM-based (no native modules)
- ✅ WebGPU support
- ✅ Active maintenance
- ✅ Cross-browser compatibility
- ✅ TypeScript types included

### Configuration Reference

**`tts.json` Structure:**

```json
{
  "tts_version": "v1.5.0",
  "split": "opensource-en",
  "ttl": {
    "latent_dim": 24,
    "chunk_compress_factor": 6
  },
  "dp": {
    "hidden_dim": 256
  },
  "ae": {
    "sample_rate": 24000,
    "base_chunk_size": 256,
    "latent_dim": 4
  }
}
```

**Key Parameters:**
- `sample_rate`: 24000 Hz output audio
- `latent_dim`: 24 (TTL), 4 (AE) - dimensionality of latent space
- `chunk_compress_factor`: 6 - temporal compression ratio
- `base_chunk_size`: 256 samples per chunk

### References

**Official Resources:**
- GitHub: https://github.com/supertone-inc/supertonic
- Hugging Face: https://huggingface.co/Supertone/supertonic
- Demo: https://huggingface.co/spaces/Supertone/supertonic
- Paper: (not yet published as of 2025-11-22)

**ONNX Runtime Web:**
- Docs: https://onnxruntime.ai/docs/get-started/with-javascript.html
- NPM: https://www.npmjs.com/package/onnxruntime-web
- GitHub: https://github.com/microsoft/onnxruntime

**Related Technologies:**
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- WebGPU: https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API
- WebAssembly: https://developer.mozilla.org/en-US/docs/WebAssembly

---

## Changelog

### 2025-11-22
- Initial documentation created
- Captured Node.js implementation attempt and failure
- Documented final browser implementation
- Added deployment strategy and troubleshooting guide

---

**Document Version:** 1.0
**Last Updated:** 2025-11-22
**Author:** Claude Code (via DC Solo RPG development)
**Status:** Production-ready ✅
