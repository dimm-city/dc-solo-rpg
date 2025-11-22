# TTS Provider Error Handling Improvements

## Summary

Added user-friendly error handling for TTS provider switching failures. When a provider fails to initialize (like Supertonic without models, or API providers without keys), users now see clear error messages instead of just console errors.

## The Errors You Were Seeing

### 1. **Supertonic WASM Loading Failures**

```
WebAssembly.instantiate(): expected magic word 00 61 73 6d, found 3c 21 64 6f
```

- **Cause**: Supertonic was trying to load ONNX models from `static/tts-models/` but they don't exist
- **The "magic word"**: WebAssembly files start with `00 61 73 6d` (ASCII: "asm")
- **What it got**: `3c 21 64 6f` (ASCII: "<!do") - the start of an HTML 404 page

### 2. **Password Field Warning**

```
Password field is not contained in a form
```

- **Cause**: TTS API key input uses `type="password"` but isn't in a `<form>` tag
- **Impact**: Harmless - just a Chrome DevTools warning about best practices
- **Status**: No fix needed - this is acceptable for settings modals

### 3. **Vite WebSocket Failures**

```
WebSocket connection to 'ws://localhost:5173/' failed
```

- **Cause**: Hot Module Replacement (HMR) connection issues during development
- **Impact**: Just means auto-reload won't work - refresh manually
- **Status**: Not related to TTS changes

## The Solution

### 1. **audioStore.svelte.js** - Re-throw Errors

Made `updateAudioSettings()` re-throw errors after logging them:

```javascript
catch (error) {
    logger.error('[AudioStore] Failed to switch TTS provider:', error);
    audioSettings.ttsProvider = previousProvider; // Revert
    throw error; // ← NEW: Let UI handle it
}
```

**Why**: This allows the UI components to catch the error and show user-friendly messages.

### 2. **AudioSettings.svelte** - Error Display

Added try-catch with user-friendly error messages:

```javascript
let providerError = $state(null);

async function handleAudioSettingChange(key, value) {
	if (key === 'ttsProvider') {
		providerError = null; // Clear old errors
	}

	try {
		await updateAudioSettings({ [key]: value });
		if (key === 'ttsProvider') {
			await loadVoices();
		}
	} catch (error) {
		// Show helpful error message
		if (value === 'supertonic') {
			providerError =
				'Supertonic TTS models not found. Please download and place ONNX models in static/tts-models/';
		} else if (value === 'openai' || value === 'elevenlabs') {
			providerError = `Failed to initialize ${value}. Please check your API key.`;
		}
	}
}
```

### 3. **Error Message UI Component**

Added styled error message display with icon:

```svelte
{#if providerError}
	<div class="error-message">
		<svg><!-- Alert icon --></svg>
		<span>{providerError}</span>
	</div>
{/if}
```

**Styling**:

- Red background with transparency
- Alert icon
- Clear, readable text
- Positioned below the provider dropdown

### 4. **TTSSection.svelte** - Same Treatment

Applied identical error handling to the AI Settings modal's TTS section.

## User Experience After Fix

### Before:

1. User selects "Supertonic" from dropdown
2. Console fills with scary WASM errors
3. Nothing visible happens in UI
4. Provider silently reverts to Browser
5. User confused about what happened

### After:

1. User selects "Supertonic" from dropdown
2. **Visible error message appears**: "Supertonic TTS models not found. Please download and place ONNX models in static/tts-models/"
3. Provider reverts to Browser (as before)
4. User understands what went wrong and what to do

## Error Messages by Provider

| Provider   | Scenario                | Error Message                                                                                  |
| ---------- | ----------------------- | ---------------------------------------------------------------------------------------------- |
| Browser    | N/A                     | Never fails (built-in)                                                                         |
| Supertonic | Models missing          | "Supertonic TTS models not found. Please download and place ONNX models in static/tts-models/" |
| OpenAI     | Missing/invalid API key | "Failed to initialize openai. Please check your API key."                                      |
| ElevenLabs | Missing/invalid API key | "Failed to initialize elevenlabs. Please check your API key."                                  |

## Technical Flow

```
┌─────────────────────────────────────┐
│ User changes provider to Supertonic │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ handleTTSSettingChange()            │
│ ├─ Clear providerError              │
│ └─ try {                            │
│      updateAudioSettings()          │
│    }                                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ audioStore.updateAudioSettings()    │
│ ├─ try {                            │
│ │    setProvider('supertonic')      │◄── Fails
│ │  }                                │
│ ├─ catch {                          │
│ │    Revert to previous provider    │
│ │    throw error ← NEW              │
│ │  }                                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ handleTTSSettingChange() catch      │
│ ├─ Set providerError with message   │
│ └─ UI re-renders with error box     │
└─────────────────────────────────────┘
```

## Benefits

1. **User Understanding**: Clear explanation of what went wrong
2. **Actionable**: Tells users exactly what they need to do
3. **No Silent Failures**: Errors are visible in the UI, not just console
4. **Provider-Specific**: Different messages for different failure types
5. **Auto-Clear**: Error disappears when changing providers again

## Files Modified

1. `src/lib/stores/audioStore.svelte.js` - Re-throw errors after reverting
2. `src/lib/components/settings/AudioSettings.svelte` - Error handling + UI
3. `src/lib/components/settings/TTSSection.svelte` - Error handling + UI

## Testing

- [x] Build succeeds
- [x] Provider reverts on error (existing behavior preserved)
- [ ] Error message appears when switching to Supertonic
- [ ] Error message appears when using API provider without key
- [ ] Error message clears when switching to Browser
- [ ] Error message clears when retrying same provider
- [ ] Works in both AudioSettings and TTSSection modals

## Future Improvements

1. **Detect Available Providers**: Disable providers that can't be initialized
2. **Provider Status Indicators**: Show checkmarks for working providers
3. **Model Download Helper**: Link to download instructions for Supertonic
4. **API Key Validation**: Test API keys before saving
