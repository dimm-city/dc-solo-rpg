# Supertonic TTS Models

This directory contains ONNX models and voice style files for the Supertonic neural TTS provider.

## Setup Instructions

### 1. Download Models

Clone the Supertonic model repository from Hugging Face:

```bash
# From the project root directory
git clone https://huggingface.co/Supertone/supertonic assets/supertonic
```

### 2. Copy Files

Copy the model files to this directory:

```bash
# Copy ONNX models
cp assets/supertonic/onnx/*.onnx static/tts-models/onnx/

# Copy voice style JSON files
cp assets/supertonic/voice_styles/*.json static/tts-models/voice_styles/
```

### 3. Verify Structure

After copying, your directory should contain:

```
tts-models/
├── onnx/
│   ├── encoder.onnx        (~80 MB)
│   ├── decoder.onnx        (~60 MB)
│   └── vocoder.onnx        (~40 MB)
└── voice_styles/
    ├── F1.json             (Female Voice 1)
    ├── F2.json             (Female Voice 2)
    ├── M1.json             (Male Voice 1)
    └── M2.json             (Male Voice 2)
```

## File Sizes

- **Total**: ~200-300 MB
- **encoder.onnx**: ~80 MB
- **decoder.onnx**: ~60 MB
- **vocoder.onnx**: ~40 MB
- **Voice styles**: ~1 KB each

## Important Notes

⚠️ **Models are not included in the repository** due to their large size. You must download them separately following the instructions above.

⚠️ **Git Ignore**: Model files (_.onnx and _.json) are gitignored to keep the repository size manageable.

⚠️ **Internet Required**: Initial download requires internet connection. After setup, TTS works completely offline.

## Troubleshooting

### Models Not Found

If you see "Failed to load ONNX models" errors:

1. Verify files exist in the directories above
2. Check file permissions (must be readable)
3. Ensure file names match exactly (case-sensitive)
4. Try clearing browser cache and reloading

### Download Issues

If the Hugging Face clone fails:

1. Ensure you have git-lfs installed: `git lfs install`
2. Try with explicit LFS: `GIT_LFS_SKIP_SMUDGE=0 git clone https://huggingface.co/Supertone/supertonic assets/supertonic`
3. Alternatively, download files manually from [Hugging Face](https://huggingface.co/Supertone/supertonic/tree/main)

## Alternative Download Methods

### Manual Download

Visit [Supertone on Hugging Face](https://huggingface.co/Supertone/supertonic) and download files manually:

1. Navigate to the `onnx/` folder
2. Download `encoder.onnx`, `decoder.onnx`, `vocoder.onnx`
3. Place them in `static/tts-models/onnx/`
4. Navigate to the `voice_styles/` folder
5. Download all `.json` files
6. Place them in `static/tts-models/voice_styles/`

### Using wget

```bash
# Create directories
mkdir -p static/tts-models/{onnx,voice_styles}

# Download ONNX models (replace URLs with actual Hugging Face URLs)
wget https://huggingface.co/Supertone/supertonic/resolve/main/onnx/encoder.onnx -O static/tts-models/onnx/encoder.onnx
wget https://huggingface.co/Supertone/supertonic/resolve/main/onnx/decoder.onnx -O static/tts-models/onnx/decoder.onnx
wget https://huggingface.co/Supertone/supertonic/resolve/main/onnx/vocoder.onnx -O static/tts-models/onnx/vocoder.onnx

# Download voice styles
wget https://huggingface.co/Supertone/supertonic/resolve/main/voice_styles/F1.json -O static/tts-models/voice_styles/F1.json
wget https://huggingface.co/Supertone/supertonic/resolve/main/voice_styles/F2.json -O static/tts-models/voice_styles/F2.json
wget https://huggingface.co/Supertone/supertonic/resolve/main/voice_styles/M1.json -O static/tts-models/voice_styles/M1.json
wget https://huggingface.co/Supertone/supertonic/resolve/main/voice_styles/M2.json -O static/tts-models/voice_styles/M2.json
```

## License

Models provided by Supertone Inc. under the OpenRAIL-M License.

See: https://github.com/supertone-inc/supertonic

## More Information

For complete setup instructions and troubleshooting, see:

- `docs/supertonic-tts-setup.md` in the project root
