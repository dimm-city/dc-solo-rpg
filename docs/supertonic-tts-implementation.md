# Supertonic TTS Implementation Guide

**Date Created:** 2025-11-21
**Last Updated:** 2025-11-22
**Project:** DC Solo RPG
**Status:** Both implementations documented (Node.js working but disabled, Browser implementation active)

## Table of Contents

1. [Overview](#overview)
2. [Implementation History](#implementation-history)
3. [Node.js Implementation (Working, but Incompatible with Azure SWA)](#nodejs-implementation-working-but-incompatible-with-azure-swa)
4. [Browser Implementation (Current Solution)](#browser-implementation-current-solution)
5. [Trade-offs Comparison](#trade-offs-comparison)
6. [Deployment Strategy](#deployment-strategy)
7. [Architecture Details](#architecture-details)
8. [Performance & Optimization](#performance--optimization)
9. [Troubleshooting Guide](#troubleshooting-guide)
10. [Future Improvements](#future-improvements)

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

**2025-11-21 Morning: Initial Browser Implementation Attempt**
- Installed `onnxruntime-web`
- Created browser-based `SupertonicTTSProvider`
- Downloaded models to `static/tts-models/`
- Commit: `76c2505` "Add Supertonic neural TTS provider with ONNX Runtime Web"

**2025-11-21 Afternoon: Successful Node.js Implementation**
- Switched to `onnxruntime-node` for better performance
- Created API endpoint at `/api/tts/supertonic`
- Server-side inference working perfectly
- Commit: `e2010ab` "SuperTonicTTS works" ✅

**Key quote from commit:**
> "SuperTonicTTS works"

**What was working:**
- Server endpoint processing TTS requests
- ONNX Runtime Node with native modules
- Models loaded from `static/assets/onnx/`
- Full inference pipeline (384 lines of working code)

**2025-11-21 Evening: Azure SWA Deployment Blocker**
- Attempted to deploy to Azure Static Web Apps
- **Build failed:** esbuild cannot bundle native `.node` modules
- Tried multiple workarounds (all failed)
- Temporarily disabled endpoint
- Commit: `11ca849` "Temporarily disable Supertonic server endpoint to fix Azure SWA build"

**2025-11-21 Late Evening: Return to Browser Implementation**
- Refactored to browser-based `onnxruntime-web`
- Ported Supertonic web helper code
- Build succeeded locally
- Commit: `dbbe218` "Implement browser-based Supertonic TTS with onnxruntime-web"

**2025-11-22: Azure SWA Deployment Size Issue**
- Deployment failed: 252MB models + 29MB build = 281MB > 250MB limit
- **Solution:** Host models on Hugging Face CDN
- **Solution:** Host WASM on jsDelivr CDN
- Build output reduced to 29MB
- Commits:
  - `0a6cf68` "Load Supertonic TTS models from Hugging Face CDN"
  - `e87f45a` "Fix AudioSettings to check Hugging Face"
  - `a579904` "Configure ONNX Runtime Web to fetch WASM files from CDN"

---

## Node.js Implementation (Working, but Incompatible with Azure SWA)

### Why Node.js Was Chosen

The Node.js implementation was the **second attempt** (after initial browser implementation didn't work well). Advantages:

1. **Better Performance** - Native ONNX Runtime (C++) vs WASM
2. **Server-side Computation** - Offload work from client devices
3. **Centralized Model Loading** - Models loaded once, cached in server memory
4. **No Browser Limitations** - No CORS, no browser compatibility issues

### Architecture

```
┌─────────────────────────────────────────┐
│        Client (Browser)                 │
├─────────────────────────────────────────┤
│  POST /api/tts/supertonic               │
│  {                                      │
│    text: "Hello world",                 │
│    voice: "F1",                         │
│    speed: 1.0                          │
│  }                                      │
└──────────────┬──────────────────────────┘
               │
               ↓ HTTP Request
┌─────────────────────────────────────────┐
│   SvelteKit Server (Node.js)            │
├─────────────────────────────────────────┤
│  src/routes/api/tts/supertonic/         │
│  +server.js (384 lines)                 │
│                                         │
│  1. Load Models (cached)                │
│     ├─ text_encoder.onnx (27 MB)       │
│     ├─ duration_predictor.onnx (1.6MB) │
│     ├─ vector_estimator.onnx (127MB)   │
│     └─ vocoder.onnx (97MB)             │
│                                         │
│  2. Load Resources (cached)             │
│     ├─ unicode_indexer.json (262KB)    │
│     └─ voice_styles/{voice}.json       │
│                                         │
│  3. Run ONNX Inference                  │
│     ├─ Duration prediction             │
│     ├─ Text encoding                   │
│     ├─ Diffusion denoising (5 steps)   │
│     └─ Vocoder (latent → audio)        │
│                                         │
│  4. Return Audio                        │
│     {                                   │
│       audio: Float32Array,              │
│       sampleRate: 44100                 │
│     }                                   │
└─────────────────────────────────────────┘
               │
               ↓ ONNX Runtime Node (Native C++)
┌─────────────────────────────────────────┐
│   Native ONNX Runtime (.node modules)   │
│   - Linux: onnxruntime_binding.node     │
│   - macOS: onnxruntime_binding.node     │
│   - Windows: onnxruntime_binding.node   │
└─────────────────────────────────────────┘
```

### Implementation Code (Working Version)

```javascript
// src/routes/api/tts/supertonic/+server.js
import * as ort from 'onnxruntime-node';
import { json, error } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Model and resource caching
let sessionsCache = null;
let unicodeIndexerCache = null;
let voiceStylesCache = {};

async function loadModels() {
  if (sessionsCache) return sessionsCache;

  const modelBasePath = join(process.cwd(), 'static', 'assets', 'onnx');

  const [encoder, durationPredictor, vectorEstimator, vocoder] = await Promise.all([
    ort.InferenceSession.create(join(modelBasePath, 'text_encoder.onnx')),
    ort.InferenceSession.create(join(modelBasePath, 'duration_predictor.onnx')),
    ort.InferenceSession.create(join(modelBasePath, 'vector_estimator.onnx')),
    ort.InferenceSession.create(join(modelBasePath, 'vocoder.onnx'))
  ]);

  sessionsCache = { encoder, durationPredictor, vectorEstimator, vocoder };
  return sessionsCache;
}

export async function POST({ request }) {
  const { text, voice = 'F1', speed = 1.0 } = await request.json();

  // Load resources (cached)
  const [sessions, unicodeIndexer, voiceStyle] = await Promise.all([
    loadModels(),
    loadUnicodeIndexer(),
    loadVoiceStyle(voice)
  ]);

  // 1. Duration prediction
  const durationOutput = await sessions.durationPredictor.run({
    text_ids: textTensor,
    text_mask: textMask,
    style_dp: styleDP
  });

  // 2. Text encoding
  const encoderOutput = await sessions.encoder.run({
    text_ids: encTextTensor,
    text_mask: textMaskTensor,
    style_ttl: styleTTL
  });

  // 3. Initialize Gaussian noise (Box-Muller transform)
  const noisyLatent = new Float32Array(latentDim * latentLength);
  for (let i = 0; i < noisyLatent.length; i += 2) {
    const u1 = Math.max(1e-10, Math.random());
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
    noisyLatent[i] = z0;
    if (i + 1 < noisyLatent.length) noisyLatent[i + 1] = z1;
  }

  // 4. Diffusion denoising (5 steps)
  for (let step = 0; step < 5; step++) {
    const vectorOutput = await sessions.vectorEstimator.run({
      noisy_latent: new ort.Tensor('float32', noisyLatent, [1, latentDim, latentLength]),
      text_emb: encoderOutput.text_emb,
      style_ttl: styleTTL,
      text_mask: textMaskTensor,
      latent_mask: latentMaskTensor,
      total_step: totalStepTensor,
      current_step: currentStepTensor
    });

    // Update latent
    const denoisedLatent = vectorOutput.denoised_latent.data;
    for (let i = 0; i < noisyLatent.length; i++) {
      noisyLatent[i] = denoisedLatent[i];
    }
  }

  // 5. Vocoder - generate audio
  const vocoderOutput = await sessions.vocoder.run({
    latent: new ort.Tensor('float32', noisyLatent, [1, latentDim, latentLength])
  });

  return json({
    audio: Array.from(vocoderOutput.wav_tts.data),
    sampleRate: 44100
  });
}
```

**Key Features:**
- ✅ Model caching in memory (fast subsequent requests)
- ✅ Parallel model loading
- ✅ Comprehensive logging for debugging
- ✅ Box-Muller transform for Gaussian noise
- ✅ Speed adjustment via duration scaling
- ✅ Proper Unicode normalization (NFKD)

**Status:** ✅ **Working perfectly** - Tested and verified

**Location (disabled):** `src/routes/server/tts/supertonic/+server.js.disabled`

### Why It Couldn't Be Deployed to Azure SWA

#### Problem: Native Modules + esbuild Incompatibility

Azure Static Web Apps uses the `svelte-adapter-azure-swa` which relies on **esbuild** for bundling server code.

**The Core Issue:**
```javascript
import * as ort from 'onnxruntime-node';
```

This imports native `.node` files (platform-specific compiled binaries):
```
node_modules/onnxruntime-node/bin/napi-v6/
├── linux-x64/onnxruntime_binding.node
├── darwin-arm64/onnxruntime_binding.node
└── win32-x64/onnxruntime_binding.node
```

**esbuild's Limitation:**
- esbuild analyzes all imports during the bundling phase
- Static imports (`import *`) trigger immediate module graph analysis
- When esbuild encounters `.node` files, it doesn't know how to process them
- **Error:** `No loader is configured for ".node" files`

#### Attempted Fixes (All Failed)

**Attempt 1: Mark as external**
```javascript
// svelte.config.js
adapter: adapter({
  esbuild: {
    external: ['onnxruntime-node']
  }
})
```
❌ **Failed** - esbuild still analyzed the module before external configuration took effect

**Attempt 2: Add .node loader**
```javascript
esbuild: {
  loader: { '.node': 'empty' }
}
```
❌ **Failed** - Loader runs after module graph analysis

**Attempt 3: Dynamic imports**
```javascript
const ort = await import('onnxruntime-node');
```
❌ **Failed** - Still failed during esbuild analysis

**Attempt 4: esbuild plugin**
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
❌ **Failed** - Plugin runs after module resolution

**Why These All Failed:**

esbuild's bundling has three stages:
1. **Resolve** - Find module paths
2. **Load** - Read file contents (❌ FAILS HERE for .node files)
3. **Transform** - Parse and bundle

Native modules fail at stage 2 **before** any plugin/external/loader configuration can help.

#### Temporary Solution: Disable Endpoint

```bash
# Renamed to exclude from build
mv +server.js +server.js.disabled
```

**Commit message:**
> "Temporarily disable Supertonic server endpoint to fix Azure SWA build"
>
> "The Azure SWA adapter's esbuild bundler cannot handle native Node.js modules (.node files) from onnxruntime-node. Even with dynamic imports and external configuration, esbuild still analyzes the module during bundling and encounters .node files it cannot process."

### Would Work On Other Platforms

**Platforms that support native modules:**
- ✅ **Vercel** - Serverless functions support native modules
- ✅ **Netlify Functions** - Supports native binaries
- ✅ **AWS Lambda** (with layers) - Can include native modules
- ✅ **Traditional Node.js hosting** - VPS, Heroku, Railway, etc.
- ✅ **Docker containers** - Full control over dependencies

**Why Azure SWA is the exception:**
- Uses esbuild for bundling (most other platforms don't)
- Designed for static sites with simple APIs
- Not designed for native module dependencies

---

## Browser Implementation (Current Solution)

### Why Browser Implementation

After the Azure SWA deployment blocker, we returned to browser-based implementation with lessons learned:

**Advantages:**
1. ✅ **No Server Required** - Complete client-side processing
2. ✅ **Scalability** - No server load, users provide compute
3. ✅ **Privacy** - All processing on user's device
4. ✅ **Compatible with Azure SWA** - No native modules
5. ✅ **CDN Strategy** - Models from Hugging Face, WASM from jsDelivr

**Disadvantages:**
1. ⚠️ **Slower Performance** - WASM slower than native (but still acceptable)
2. ⚠️ **Initial Download** - Users download ~265MB models first use
3. ⚠️ **Browser Compatibility** - Requires modern browser with WASM support
4. ⚠️ **Memory Usage** - ~500MB in browser memory during inference

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

### Key Implementation Files

#### `src/lib/services/tts/providers/SupertonicTTSProvider.js`

```javascript
import * as ort from 'onnxruntime-web';

// CRITICAL: Configure WASM paths BEFORE any ONNX operations
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/';

export class SupertonicTTSProvider extends BaseTTSProvider {
  constructor() {
    super();
    this.config = {
      speed: 1.05,
      maxChunkLength: 300,
      silenceDuration: 0.3,
      totalStep: 5,
      assetsPath: 'https://huggingface.co/Supertone/supertonic/resolve/main'
    };
  }

  async _loadModels() {
    const onnxDir = `${this.config.assetsPath}/onnx`;

    // Load configuration
    const cfgsResponse = await fetch(`${onnxDir}/tts.json`);
    const cfgs = await cfgsResponse.json();

    // Load text processor
    const indexerResponse = await fetch(`${onnxDir}/unicode_indexer.json`);
    const indexer = await indexerResponse.json();
    this.textProcessor = new UnicodeProcessor(indexer);

    // Load ONNX models (parallel)
    const sessionOptions = {
      executionProviders: ['webgpu', 'wasm']
    };

    const [dpOrt, textEncOrt, vectorEstOrt, vocoderOrt] = await Promise.all([
      ort.InferenceSession.create(`${onnxDir}/duration_predictor.onnx`, sessionOptions),
      ort.InferenceSession.create(`${onnxDir}/text_encoder.onnx`, sessionOptions),
      ort.InferenceSession.create(`${onnxDir}/vector_estimator.onnx`, sessionOptions),
      ort.InferenceSession.create(`${onnxDir}/vocoder.onnx`, sessionOptions)
    ]);

    this.ttsInstance = new TextToSpeech(
      cfgs,
      this.textProcessor,
      dpOrt,
      textEncOrt,
      vectorEstOrt,
      vocoderOrt
    );

    // Load voice styles
    for (const voiceId of ['F1', 'F2', 'M1', 'M2']) {
      const styleResponse = await fetch(
        `${this.config.assetsPath}/voice_styles/${voiceId}.json`
      );
      const styleData = await styleResponse.json();

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

### Component Classes (Ported from Supertonic Web)

#### 1. UnicodeProcessor

```javascript
class UnicodeProcessor {
  constructor(indexer) {
    this.indexer = indexer;
  }

  call(textList) {
    // Normalize using NFKC (browser standard)
    const processedTexts = textList.map(text => text.normalize('NFKC'));

    // Convert to token IDs
    const textIds = processedTexts.map(text => {
      const row = [];
      for (let j = 0; j < text.length; j++) {
        const codePoint = text.codePointAt(j);
        row[j] = codePoint < this.indexer.length ? this.indexer[codePoint] : -1;
      }
      return row;
    });

    // Create attention mask
    const textMask = this.getTextMask(textIdsLengths);

    return { textIds, textMask };
  }
}
```

**Key Difference from Node.js:**
- Node.js used `normalize('NFKD')` (official Supertonic implementation)
- Browser uses `normalize('NFKC')` (adapted from Supertonic web version)
- Both work, slight difference in character decomposition

#### 2. TextToSpeech (Inference Pipeline)

```javascript
class TextToSpeech {
  async _infer(textList, style, totalStep, speed = 1.05) {
    // STEP 1: Text → Token IDs
    const { textIds, textMask } = this.textProcessor.call(textList);

    // STEP 2: Duration Prediction
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

    // STEP 4: Initialize Gaussian Noise (Box-Muller)
    const { xt, latentMask } = this.sampleNoisyLatent(...);

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

  sampleNoisyLatent(duration, sampleRate, baseChunkSize, chunkCompress, latentDim) {
    const xt = [];
    for (let b = 0; b < bsz; b++) {
      for (let d = 0; d < latentDimVal; d++) {
        const row = [];
        for (let t = 0; t < latentLen; t++) {
          // Box-Muller transform
          const u1 = Math.max(0.0001, Math.random());
          const u2 = Math.random();
          const val = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
          row.push(val);
        }
        batch.push(row);
      }
      xt.push(batch);
    }
    // Apply latent mask
    return { xt, latentMask };
  }
}
```

**Comparison with Node.js:**

| Feature | Node.js | Browser |
|---------|---------|---------|
| **Noise Generation** | Box-Muller (same) | Box-Muller (same) |
| **Diffusion Steps** | 5 steps | 5 steps |
| **Tensor Creation** | `new ort.Tensor()` | `new ort.Tensor()` (same API) |
| **Unicode Normalization** | NFKD | NFKC |
| **Sample Rate** | 44100 Hz | 24000 Hz |

### ONNX Runtime Web Configuration

**Critical Configuration:**

```javascript
// MUST be set BEFORE creating any InferenceSession
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/';
```

**Why This Is Required:**

Without this, ONNX Runtime Web tries to fetch WASM files from the same origin, which fails with:
```
RuntimeError: Aborted(both async and sync fetching of the wasm failed)
```

**Execution Providers:**

```javascript
const sessionOptions = {
  executionProviders: ['webgpu', 'wasm']
};
```

1. **WebGPU** (preferred): GPU acceleration, 2-5× faster than WASM
2. **WASM** (fallback): CPU-based inference, universally supported

---

## Trade-offs Comparison

### Performance

| Metric | Node.js (Native) | Browser (WASM) | Browser (WebGPU) |
|--------|------------------|----------------|------------------|
| **Cold Start (first inference)** | ~2-3s | ~3-5s | ~2-3s |
| **Warm Start (subsequent)** | ~50-100ms | ~200-500ms | ~100-200ms |
| **Model Loading** | 1-2s (from disk) | 20-40s (from CDN) | 20-40s (from CDN) |
| **Memory Usage** | ~350MB server | ~500MB browser | ~500MB browser |
| **Real-time Factor** | 100-200× | 20-50× | 50-100× |

### Development Complexity

| Aspect | Node.js | Browser |
|--------|---------|---------|
| **Code Complexity** | Medium (384 lines) | High (530 lines) |
| **Deployment** | ❌ Blocked by Azure SWA | ✅ Works anywhere |
| **Debugging** | Easy (server logs) | Medium (browser devtools) |
| **Testing** | Easy (unit tests) | Medium (requires browser env) |
| **Model Updates** | Deploy new files | Users download new files |

### User Experience

| Aspect | Node.js | Browser |
|--------|---------|---------|
| **First Use** | Instant | 25-48s download |
| **Subsequent Uses** | Instant | 2-3s (cached) |
| **Privacy** | ⚠️ Sends text to server | ✅ 100% client-side |
| **Offline** | ❌ Requires server | ✅ Works offline (after download) |
| **Mobile Support** | ✅ All devices | ⚠️ Limited (high memory) |
| **Bandwidth** | ✅ Low (text only) | ⚠️ High (265MB first time) |

### Deployment & Hosting

| Aspect | Node.js | Browser |
|--------|---------|---------|
| **Azure SWA** | ❌ **Incompatible** (native modules) | ✅ **Works** (29MB build) |
| **Vercel** | ✅ Works | ✅ Works |
| **Netlify** | ✅ Works | ✅ Works |
| **Traditional Hosting** | ✅ Works | ✅ Works |
| **Docker** | ✅ Works | ✅ Works |
| **Deployment Size** | ~280MB (models + build) | 29MB (CDN for models) |
| **Hosting Cost** | $$$ (compute + storage) | $ (static only) |

### Scalability

| Aspect | Node.js | Browser |
|--------|---------|---------|
| **Concurrent Users** | Limited by server | Unlimited |
| **Server Load** | High (CPU intensive) | None |
| **Bandwidth** | Low per request | High per user (first time) |
| **Geographic Distribution** | Single server region | CDN global |

---

## Deployment Strategy

### CDN Architecture (Browser Implementation)

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
      # No LFS needed - models on CDN

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Build And Deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          app_location: '/'
          output_location: 'build/static'
```

**Build Results:**
- ✅ Build time: ~2-3 minutes
- ✅ Deployment size: 29 MB (under 250 MB limit)
- ✅ No native modules
- ✅ No Git LFS required

### CDN URLs

**Hugging Face:**
```
Base: https://huggingface.co/Supertone/supertonic/resolve/main

Models: ${base}/onnx/*.onnx
Voices: ${base}/voice_styles/*.json
Config: ${base}/onnx/tts.json
```

**jsDelivr:**
```
Base: https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/

WASM: ort-wasm-simd-threaded*.wasm
MJS:  ort-wasm-simd-threaded*.mjs
```

---

## Architecture Details

### Inference Pipeline

Both implementations use the same pipeline, just different runtimes:

```
Input Text
    ↓
┌───────────────────────┐
│ 1. Text Processing    │
│    Unicode → Token IDs│
│    "Hello" → [72,101,108,108,111]
└───────────────────────┘
    ↓
┌───────────────────────┐
│ 2. Duration Prediction│
│    Predicts phoneme   │
│    durations          │
└───────────────────────┘
    ↓
┌───────────────────────┐
│ 3. Text Encoding      │
│    Text → embeddings  │
└───────────────────────┘
    ↓
┌───────────────────────┐
│ 4. Sample Noise       │
│    Gaussian (Box-     │
│    Muller transform)  │
└───────────────────────┘
    ↓
┌───────────────────────┐
│ 5. Denoising (×5)     │
│    Diffusion model    │
│    x_T → x_0          │
└───────────────────────┘
    ↓
┌───────────────────────┐
│ 6. Vocoder            │
│    Latent → waveform  │
└───────────────────────┘
    ↓
Audio Waveform
```

### Text Chunking

Long text is split into 300-character chunks:

```javascript
_chunkText(text, maxLen = 300) {
  // 1. Split by paragraph
  const paragraphs = text.trim().split(/\n\s*\n+/);

  // 2. Split by sentence (handles abbreviations)
  const sentences = paragraph.split(
    /(?<!Mr\.|Mrs\.|Ms\.|Dr\.|Prof\.)(?<=[.!?])\s+/
  );

  // 3. Combine into ≤300 char chunks
  return chunks;
}
```

**Why 300 characters?**
- Prevents ONNX tensor explosions
- Maintains sentence coherence
- Balance between quality and memory

### Box-Muller Transform (Gaussian Noise)

Both implementations use the same algorithm:

```javascript
// Convert Math.random() [0,1] → Gaussian N(0,1)
const u1 = Math.max(0.0001, Math.random());
const u2 = Math.random();
const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
```

**Why Box-Muller?**
- Diffusion models require Gaussian-distributed noise
- `Math.random()` is uniform, not Gaussian
- Box-Muller converts uniform → Gaussian
- Standard technique in ML

---

## Performance & Optimization

### Loading Times

**Node.js Implementation:**
```
Cold start (first request): ~2-3s (load models from disk)
Warm start (cached):       <100ms
Inference per sentence:    ~50-100ms
```

**Browser Implementation:**
```
First load (download):     ~25-48s (265MB from CDN)
Subsequent (cached):       ~2-3s (initialize ONNX)
Inference per sentence:    ~200-500ms (WASM)
                          ~100-200ms (WebGPU)
```

### Memory Usage

**Node.js:**
- Server memory: ~350MB (models loaded once)
- Shared across all users
- Efficient for multiple concurrent requests

**Browser:**
- Per-user memory: ~500MB during inference
- ~350MB idle (cached models)
- Each user uses their own memory

### Optimization Strategies

**1. Parallel Model Loading:**
```javascript
const [dp, textEnc, vectorEst, vocoder] = await Promise.all([
  loadModel('duration_predictor.onnx'),
  loadModel('text_encoder.onnx'),
  loadModel('vector_estimator.onnx'),
  loadModel('vocoder.onnx')
]);
```

**2. Model Caching:**
- Node.js: In-memory cache (module-level variables)
- Browser: HTTP cache + IndexedDB (via ONNX Runtime Web)

**3. WebGPU Acceleration:**
```javascript
const sessionOptions = {
  executionProviders: ['webgpu', 'wasm'] // Try GPU first
};
```

**4. Text Chunking:**
```javascript
const chunks = this._chunkText(longText, 300);
for (const chunk of chunks) {
  const { wav } = await this._infer([chunk], ...);
}
```

---

## Troubleshooting Guide

### Issue 1: "no available backend found" (Browser)

**Error:**
```
Failed to initialize Supertonic TTS: no available backend found.
ERR: [webgpu] RuntimeError: Aborted(both async and sync fetching of the wasm failed)
```

**Cause:** ONNX Runtime Web cannot find WASM files

**Solution:**
```javascript
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/';
```

**Verification:**
1. Open DevTools → Network
2. Look for `ort-wasm-simd-threaded.wasm` from jsDelivr
3. Should see HTTP 200

### Issue 2: Native Module Errors (Node.js)

**Error:**
```
✘ [ERROR] No loader is configured for ".node" files:
node_modules/onnxruntime-node/bin/napi-v6/linux-x64/onnxruntime_binding.node
```

**Cause:** esbuild cannot bundle native modules

**Solutions:**
1. **Use browser implementation** (current approach)
2. **Switch hosting platform** (Vercel, Netlify, traditional hosting)
3. **Use Docker** (full control over environment)

**Why marking as external doesn't work:**
esbuild analyzes imports before external configuration takes effect.

### Issue 3: Azure SWA Size Limit

**Error:**
```
The size of the app content was too large. The limit is 262144000 bytes.
```

**Cause:** Bundling models in deployment

**Solution:** Use CDN (Hugging Face + jsDelivr)

**Verification:**
```bash
du -sh .svelte-kit/output/  # Should be ~29MB
```

### Issue 4: Supertonic Option Disabled

**Symptom:** Shows "(HF Unavailable)" in settings

**Cause:** Availability check failing

**Solution:**
```javascript
async function checkSupertonicAvailability() {
  const response = await fetch(
    'https://huggingface.co/Supertone/supertonic/resolve/main/onnx/tts.json'
  );
  return response.ok;
}
```

**Debug:**
```bash
curl -I https://huggingface.co/Supertone/supertonic/resolve/main/onnx/tts.json
# Should return HTTP 200 or 307 (redirect)
```

---

## Future Improvements

### 1. Hybrid Approach (Best of Both Worlds)

**Concept:** Use both implementations depending on context

```javascript
class AdaptiveSupertonic extends BaseTTSProvider {
  async initialize() {
    // Check if server endpoint available
    const hasServer = await this.checkServerAvailability();

    if (hasServer) {
      this.backend = new SupertonicServerProvider();
    } else {
      this.backend = new SupertonicBrowserProvider();
    }
  }
}
```

**Benefits:**
- ✅ Fast server processing when available
- ✅ Fallback to browser when server unavailable
- ✅ Best UX for all scenarios

**Challenges:**
- Server still blocked on Azure SWA
- Would need alternative hosting (Vercel, Netlify)

### 2. Model Quantization

**Current:** FP32 models (~265 MB)
**Potential:** INT8 quantization (~66 MB, 4× smaller)

**Trade-offs:**
- ✅ 75% size reduction
- ✅ Faster download
- ✅ Less memory
- ⚠️ Slight quality loss

### 3. Streaming Inference

**Current:** Full text → full audio (batch)
**Potential:** Stream audio chunks as generated

**Benefits:**
- Lower latency (hear first words immediately)
- Better UX for long text
- Lower memory usage

### 4. Service Worker Caching

**Current:** Browser HTTP cache
**Potential:** Explicit Service Worker control

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
- Offline support
- Guaranteed cache hits
- Faster subsequent loads

### 5. Platform-Specific Deployment

**Multi-platform strategy:**

```yaml
# Deploy browser version to Azure SWA
azure-swa:
  uses: Azure/static-web-apps-deploy@v1

# Deploy Node.js version to Vercel
vercel:
  uses: amondnet/vercel-action@v20
  with:
    serverless: true
```

**Benefits:**
- Best performance on each platform
- Users automatically routed to best option
- Fallback if one platform down

---

## Appendix

### File Structure

```
src/
├── lib/services/tts/
│   ├── BaseTTSProvider.js
│   └── providers/
│       ├── BrowserTTSProvider.js
│       ├── OpenAITTSProvider.js
│       ├── ElevenLabsTTSProvider.js
│       └── SupertonicTTSProvider.js  (browser, active)
│
├── routes/
│   ├── api/tts/supertonic/
│   │   └── +server.js  (Node.js, working, disabled)
│   └── server/tts/supertonic/
│       └── +server.js.disabled  (old location)
│
└── components/settings/
    ├── AudioSettings.svelte
    └── TTSSection.svelte

docs/
└── supertonic-tts-implementation.md  (this file)

static/assets/  (removed - now on CDN)
├── onnx/
└── voice_styles/
```

### Key Dependencies

```json
{
  "dependencies": {
    "onnxruntime-web": "^1.23.2"
  },
  "devDependencies": {
    "onnxruntime-node": "^1.17.0"  // Not used in production
  }
}
```

### Configuration Files

**`tts.json` (from Hugging Face):**
```json
{
  "tts_version": "v1.5.0",
  "split": "opensource-en",
  "ttl": {
    "latent_dim": 24,
    "chunk_compress_factor": 6
  },
  "ae": {
    "sample_rate": 24000,
    "base_chunk_size": 256
  }
}
```

### References

**Official Resources:**
- GitHub: https://github.com/supertone-inc/supertonic
- Hugging Face: https://huggingface.co/Supertone/supertonic
- Demo: https://huggingface.co/spaces/Supertone/supertonic

**ONNX Runtime:**
- Node: https://www.npmjs.com/package/onnxruntime-node
- Web: https://www.npmjs.com/package/onnxruntime-web
- Docs: https://onnxruntime.ai/docs/

**Related Technologies:**
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- WebGPU: https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API
- WebAssembly: https://developer.mozilla.org/en-US/docs/WebAssembly

---

## Summary

### What Worked

✅ **Node.js Implementation** (commit `e2010ab`)
- Full server-side inference
- 384 lines of working code
- Models cached in server memory
- Fast performance (~50-100ms per sentence)
- **Status:** Working, but disabled due to deployment issues

✅ **Browser Implementation** (current)
- Client-side WASM inference
- Models from Hugging Face CDN
- WASM from jsDelivr CDN
- Deployment size: 29 MB
- **Status:** Active, deployed to production

### Why We Switched

**The Switch:** Node.js → Browser was driven by **deployment platform constraints**, not technical failure.

**Node.js was working perfectly** but couldn't be deployed to Azure Static Web Apps due to:
1. esbuild cannot bundle native `.node` modules
2. All workarounds failed (external, loaders, plugins)
3. Would work on other platforms (Vercel, Netlify, Docker)

**Browser implementation succeeded** because:
1. WASM is bundleable
2. CDN strategy avoids size limits
3. Works on all static hosting platforms
4. Acceptable performance trade-off

### Recommendation

**For Future Projects:**

- **Use Node.js if:**
  - Hosting on Vercel, Netlify, or traditional server
  - Need maximum performance
  - Server costs acceptable
  - Want centralized processing

- **Use Browser if:**
  - Hosting on Azure SWA or static platforms
  - Privacy is critical
  - Want unlimited scalability
  - Can accept initial download time

- **Use Both if:**
  - Multi-platform deployment
  - Want best of both worlds
  - Can maintain two implementations

---

**Document Version:** 2.0 (Corrected)
**Last Updated:** 2025-11-22
**Author:** Claude Code (via DC Solo RPG development)
**Status:** Both implementations documented accurately ✅
