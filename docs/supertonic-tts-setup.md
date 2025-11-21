# Supertonic TTS Setup Guide

This guide explains how to set up and use the Supertonic neural text-to-speech (TTS) provider in DC Solo RPG.

## Overview

Supertonic is a lightning-fast, on-device TTS system that runs entirely in your browser using ONNX Runtime Web. Key features:

- **On-Device Processing**: No API calls, no cloud dependencies, complete privacy
- **High Performance**: Up to 167× faster than real-time on modern hardware
- **WebGPU Acceleration**: Automatic GPU acceleration with WASM fallback
- **Neural Quality**: Natural-sounding voices using 66M parameter models
- **4 Voice Presets**: M1, M2, F1, F2 (male and female options)

## Prerequisites

- Modern browser with WebAssembly support (all major browsers)
- WebGPU support recommended for best performance (Chrome/Edge 113+)
- Approximately 200-300 MB disk space for models

## Installation Steps

### 1. Install Dependencies

The required npm packages (`onnxruntime-web` and `fft.js`) are already installed with the project.

### 2. Download ONNX Models

You need to download the Supertonic models from Hugging Face:

```bash
# Clone the model repository (from project root)
git clone https://huggingface.co/Supertone/supertonic assets/supertonic
```

### 3. Set Up Model Directory Structure

Create the required directory structure in your `static/` directory:

```bash
# From project root
mkdir -p static/tts-models/onnx
mkdir -p static/tts-models/voice_styles
```

### 4. Copy Model Files

Copy the ONNX models and voice style files to the static directory:

```bash
# Copy ONNX models
cp assets/supertonic/onnx/*.onnx static/tts-models/onnx/

# Copy voice style JSON files
cp assets/supertonic/voice_styles/*.json static/tts-models/voice_styles/
```

Your directory structure should look like this:

```
static/
└── tts-models/
    ├── onnx/
    │   ├── encoder.onnx
    │   ├── decoder.onnx
    │   └── vocoder.onnx
    └── voice_styles/
        ├── F1.json
        ├── F2.json
        ├── M1.json
        └── M2.json
```

### 5. Verify Setup

1. Start the development server: `npm run dev`
2. Navigate to the game settings
3. Select "Supertonic Neural TTS" from the TTS Provider dropdown
4. Choose a voice style (F1, F2, M1, or M2)
5. Test with some sample text

## Configuration Options

### Voice Styles

Supertonic provides 4 pre-trained voice styles:

- **F1** (Female Voice 1): Natural, clear female voice
- **F2** (Female Voice 2): Alternative female voice with different characteristics
- **M1** (Male Voice 1): Natural, clear male voice
- **M2** (Male Voice 2): Alternative male voice with different characteristics

### Speed Control

Adjust speech speed from 0.5× (slow) to 2.0× (fast). Default is 1.0×.

### Advanced Configuration

For developers, additional options can be configured in the provider initialization:

```javascript
import { ttsService } from '$lib/services/tts/textToSpeech.js';

await ttsService.setProvider('supertonic', {
	voice: 'F1',                    // Voice preset
	speed: 1.0,                     // Speech speed multiplier
	denoisingSteps: 1.0,            // Quality control (0.9-1.5)
	maxChunkLength: 200,            // Characters per chunk
	modelPaths: {                   // Custom model paths (optional)
		encoder: '/path/to/encoder.onnx',
		decoder: '/path/to/decoder.onnx',
		vocoder: '/path/to/vocoder.onnx'
	}
});
```

## Performance Optimization

### WebGPU vs WASM

- **WebGPU** (Chrome/Edge 113+): Fastest performance, recommended
- **WASM** (fallback): Works on all browsers, still very fast

The provider automatically detects and uses the best available backend.

### Text Chunking

Long texts are automatically split into chunks for:
- Better memory management
- Smoother playback
- Natural pauses between sentences

Default chunk size is 200 characters. Adjust via `maxChunkLength` config option.

## Troubleshooting

### Models Fail to Load

**Symptom**: "Failed to load ONNX models" error

**Solutions**:
1. Verify model files are in `static/tts-models/onnx/`
2. Check browser console for 404 errors
3. Ensure file permissions allow reading
4. Try clearing browser cache

### Voice Style Not Found

**Symptom**: "Failed to load voice style" error

**Solutions**:
1. Verify voice style JSON files are in `static/tts-models/voice_styles/`
2. Check that files are named correctly: `F1.json`, `F2.json`, `M1.json`, `M2.json`
3. Verify JSON files are valid (not corrupted)

### Poor Performance

**Symptom**: Slow synthesis, choppy audio

**Solutions**:
1. Use a WebGPU-compatible browser (Chrome/Edge 113+)
2. Close other browser tabs to free memory
3. Reduce text length or chunk size
4. Lower denoising steps slightly (try 0.9)

### Audio Not Playing

**Symptom**: Synthesis succeeds but no audio output

**Solutions**:
1. Check browser audio permissions
2. Ensure browser is not muted
3. Try a different browser
4. Check Web Audio API compatibility

### Memory Issues

**Symptom**: Browser crashes or becomes unresponsive

**Solutions**:
1. Process shorter text segments
2. Close other browser tabs
3. Increase browser memory limit (if available)
4. Use WASM backend instead of WebGPU

## Technical Details

### Model Architecture

Supertonic uses a three-stage neural TTS pipeline:

1. **Encoder**: Converts text to linguistic features
2. **Decoder**: Generates mel-spectrogram from features and style embedding
3. **Vocoder**: Converts mel-spectrogram to waveform audio

### Audio Format

- **Sample Rate**: 22,050 Hz
- **Channels**: Mono
- **Bit Depth**: 16-bit (floating point internally)
- **Format**: PCM audio via Web Audio API

### Browser Compatibility

| Browser | WebGPU | WASM | Status |
|---------|--------|------|--------|
| Chrome 113+ | ✅ | ✅ | Full support |
| Edge 113+ | ✅ | ✅ | Full support |
| Firefox | ❌ | ✅ | WASM only |
| Safari | ❌ | ✅ | WASM only |

## API Reference

### SupertonicTTSProvider

```javascript
import { SupertonicTTSProvider } from '$lib/services/tts/providers/SupertonicTTSProvider.js';

const provider = new SupertonicTTSProvider();

// Initialize
await provider.initialize({
	voice: 'F1',
	speed: 1.0,
	denoisingSteps: 1.0
});

// Speak text
await provider.speak('Hello, this is a test of Supertonic TTS.');

// Change voice
await provider.setVoice('M1');

// Stop playback
provider.stop();

// Pause/Resume
provider.pause();
provider.resume();

// Check status
const isSpeaking = provider.isSpeaking();

// Get available voices
const voices = await provider.getVoices();

// Clean up
await provider.dispose();
```

## License

Supertonic models are provided by Supertone Inc. under the OpenRAIL-M License.

- **Code**: MIT License
- **Models**: OpenRAIL-M License

See the [Supertonic repository](https://github.com/supertone-inc/supertonic) for full license details.

## Credits

- **Supertonic TTS**: [Supertone Inc.](https://github.com/supertone-inc/supertonic)
- **ONNX Runtime Web**: [Microsoft ONNX Runtime](https://onnxruntime.ai/)
- **Integration**: DC Solo RPG Team

## Additional Resources

- [Supertonic GitHub Repository](https://github.com/supertone-inc/supertonic)
- [Supertonic on Hugging Face](https://huggingface.co/Supertone/supertonic)
- [ONNX Runtime Web Documentation](https://onnxruntime.ai/docs/tutorials/web/)
- [Web Audio API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

## Support

For issues related to:

- **Supertonic models**: [GitHub Issues](https://github.com/supertone-inc/supertonic/issues)
- **DC Solo RPG integration**: [DC Solo RPG Issues](https://github.com/dimm-city/dc-solo-rpg/issues)
