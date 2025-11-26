# DimmCityAI TTS Provider

The DimmCityAI TTS provider wraps calls to a pre-configured OpenAI-compatible speech API endpoint at `https://api.dimmcity.ai/v1/audio/speech`.

**Important:** The API endpoint is hardcoded and cannot be changed by consumers. This provider is specifically for use with the DimmCityAI TTS service.

## Features

- **Pre-configured endpoint**: Hardcoded to `https://api.dimmcity.ai/v1/audio/speech`
- **OpenAI-compatible API**: Uses the standard OpenAI speech API format
- **Voice selection**: Support for 6 voices (alloy, echo, fable, onyx, nova, shimmer)
- **Speed control**: Adjustable speech speed from 0.25x to 4.0x
- **High-quality audio**: Support for multiple formats (mp3, opus, aac, flac, wav, pcm)
- **Web Audio API**: Browser-based audio playback
- **Model selection**: Support for `tts-1` (standard) and `tts-1-hd` (high definition)

## Configuration

### Basic Setup

```javascript
import { ttsService } from '@dimm-city/dc-solo-rpg';

// Initialize the DimmCityAI provider
await ttsService.setProvider('dimmcityai', {
	apiKey: 'your-api-key-here',
	voice: 'alloy', // Default voice
	model: 'tts-1', // or 'tts-1-hd' for higher quality
	speed: 1.0 // Speech speed (0.25 to 4.0)
});

// Speak some text
await ttsService.speak('Hello, welcome to the game!');
```

### Configuration Options

| Option           | Type   | Default    | Description                                   |
| ---------------- | ------ | ---------- | --------------------------------------------- |
| `apiKey`         | string | _required_ | DimmCityAI API key for authentication         |
| `voice`          | string | `'alloy'`  | Voice ID (see available voices below)         |
| `model`          | string | `'tts-1'`  | Model to use (`tts-1` or `tts-1-hd`)          |
| `speed`          | number | `1.0`      | Speech speed (0.25 to 4.0)                    |
| `responseFormat` | string | `'mp3'`    | Audio format (mp3, opus, aac, flac, wav, pcm) |

**Note:** The API endpoint (`https://api.dimmcity.ai/v1/audio/speech`) is hardcoded and cannot be configured.

### Available Voices

The provider supports 6 OpenAI-compatible voices:

- **alloy** - Neutral, balanced voice
- **echo** - Clear, expressive voice
- **fable** - Warm, engaging voice
- **onyx** - Deep, authoritative voice
- **nova** - Bright, energetic voice
- **shimmer** - Smooth, professional voice

## Usage Examples

### Using via Settings UI

The easiest way to use DimmCityAI TTS is through the game's settings interface:

1. Open **Settings** → **Audio**
2. Select **DimmCityAI TTS** from the TTS Provider dropdown
3. Enter your DimmCityAI API key
4. Select your preferred voice (Alloy, Echo, Fable, Onyx, Nova, or Shimmer)
5. The provider is now ready to use for narration

### Using in a Game Component

```javascript
import { ttsService } from '$lib/services/tts/textToSpeech.js';

// Initialize once (e.g., in settings or game initialization)
await ttsService.setProvider('dimmcityai', {
	apiKey: import.meta.env.VITE_DIMMCITY_API_KEY,
	voice: 'nova',
	speed: 1.1
});

// Use throughout your game
async function speakCardStory(card) {
	await ttsService.speak(card.story);
}
```

### Changing Voice Dynamically

```javascript
// Change voice without reinitializing
await ttsService.speak('Hello in Alloy voice', { voice: 'alloy' });
await ttsService.speak('Hello in Echo voice', { voice: 'echo' });
```

### Controlling Playback

```javascript
// Start speaking
await ttsService.speak('This is a long story...');

// Pause
ttsService.pause();

// Resume
ttsService.resume();

// Stop
ttsService.stop();

// Check if speaking
if (ttsService.isSpeaking()) {
	console.log('TTS is currently active');
}
```

## Environment Variables

For security, store your API key in environment variables:

```bash
# .env.local
VITE_DIMMCITY_API_KEY=your-api-key-here
```

Then access it in your code:

```javascript
await ttsService.setProvider('dimmcityai', {
	apiKey: import.meta.env.VITE_DIMMCITY_API_KEY
});
```

## API Compatibility

The DimmCityAI provider is compatible with any API that implements the OpenAI speech API format:

### Request Format

```http
POST /v1/audio/speech
Content-Type: application/json
Authorization: Bearer {apiKey}

{
  "model": "tts-1",
  "input": "Text to speak",
  "voice": "alloy",
  "speed": 1.0,
  "response_format": "mp3"
}
```

### Response Format

Returns audio file as `ArrayBuffer` in the specified format.

## Error Handling

```javascript
try {
	await ttsService.setProvider('dimmcityai', {
		apiKey: 'your-api-key'
	});
	await ttsService.speak('Hello world');
} catch (error) {
	if (error.message.includes('API request failed')) {
		console.error('API error:', error);
		// Handle API errors (invalid key, rate limits, etc.)
	} else if (error.message.includes('Web Audio API not supported')) {
		console.error('Browser does not support audio playback');
		// Fall back to browser TTS
		await ttsService.setProvider('browser');
	}
}
```

## Performance Considerations

- **Latency**: API calls introduce network latency (typically 200-500ms for first byte)
- **Caching**: Consider implementing client-side caching for repeated phrases
- **Quality vs Speed**: Use `tts-1` for faster response, `tts-1-hd` for higher quality
- **Format**: mp3 provides good balance of quality and size

## Comparison with Other Providers

| Feature       | Browser              | Supertonic               | DimmCityAI        |
| ------------- | -------------------- | ------------------------ | ----------------- |
| **Quality**   | Varies by OS/browser | High (neural TTS)        | High (neural TTS) |
| **Latency**   | Instant              | ~50-100ms                | ~200-500ms        |
| **Offline**   | ✅ Yes               | ❌ No (downloads models) | ❌ No             |
| **Cost**      | Free                 | Free                     | Paid API          |
| **Voices**    | System dependent     | 4 voices                 | 6 voices          |
| **Languages** | Many                 | English                  | Many              |

## Troubleshooting

### "API request failed: 401"

- Check your API key is correct
- Ensure the key has proper permissions

### "API request failed: 429"

- Rate limit exceeded
- Implement request throttling or upgrade API plan

### "Web Audio API not supported"

- Browser does not support Web Audio API
- Use a modern browser (Chrome, Firefox, Safari, Edge)

### Audio not playing

- Check browser autoplay policies
- Ensure AudioContext is resumed after user interaction
- Check console for error messages

## Implementation Details

The provider uses:

- **Fetch API** for HTTP requests
- **Web Audio API** for audio playback
- **AudioContext.decodeAudioData()** for audio decoding
- **BaseTTSProvider** interface for consistency

Source: `src/lib/services/tts/providers/DimmCityAITTSProvider.js`
