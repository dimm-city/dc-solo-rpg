# TTS Management System Refactoring

## Summary

Successfully unified the Text-to-Speech (TTS) management system to use a single source of truth. Previously, there were two separate systems managing TTS settings in different storage locations. Now all TTS configuration flows through `audioStore.svelte.js`.

## Changes Made

### 1. **audioStore.svelte.js** - Enhanced with API Key Support
- Added `ttsApiKey` field to store API keys for non-browser TTS providers
- Updated `updateAudioSettings()` to pass API key to TTS service
- Updated `loadSettings()` to restore API key from localStorage

**Location:** `src/lib/stores/audioStore.svelte.js`

### 2. **AudioSettings.svelte** - Added Provider Selector
- Added TTS provider dropdown (Browser, Supertonic, OpenAI, ElevenLabs)
- Added conditional API key input field for non-browser providers
- Added styling for password inputs
- Provider changes automatically reload available voices

**Location:** `src/lib/components/settings/AudioSettings.svelte`

### 3. **TTSSection.svelte** - Refactored to Use audioStore
- Removed all `$bindable` props (ttsProvider, ttsApiKey, ttsVoice, etc.)
- Now imports directly from audioStore
- Uses `getAudioSettings()` and `updateAudioSettings()` for all state management
- Handles voice loading when provider changes
- Added ElevenLabs voice ID input field

**Location:** `src/lib/components/settings/TTSSection.svelte`

### 4. **AISettings.svelte** - Simplified TTS Integration
- Removed all TTS-related state variables
- Removed TTS settings loading from IndexedDB
- Removed TTS settings from save operation
- TTSSection now manages its own state via audioStore
- Added comments explaining the new architecture

**Location:** `src/lib/components/AISettings.svelte`

### 5. **aiSettings.js** - Deprecated TTS Functions
- Marked `saveTTSSettings()` as deprecated
- Marked `loadTTSSettings()` as deprecated
- Both functions now return defaults and log warnings
- Updated `clearAISettings()` to only clear AI provider settings
- Added documentation pointing to audioStore

**Location:** `src/lib/services/aiSettings.js`

### 6. **textToSpeech.js** - Updated to Use audioStore
- Changed from using `loadTTSSettings()` to `getAudioSettings()`
- Now reads TTS provider and API key from audioStore
- Updated `isTTSAvailable()` to check audioStore
- Marked entire file as deprecated in favor of new TTS architecture
- Added documentation pointing to new TTS service

**Location:** `src/lib/services/textToSpeech.js`

## Architecture After Refactoring

```
┌─────────────────────────────────────────┐
│         Single Source of Truth          │
│                                         │
│     audioStore.svelte.js (localStorage) │
│                                         │
│  - ttsProvider                          │
│  - ttsVoice                             │
│  - ttsApiKey (NEW)                      │
│  - readingSpeed                         │
│  - autoReadCards                        │
│  - autoReadPrompts                      │
│  - autoAnnounceRolls                    │
└────────────┬────────────────────────────┘
             │
             ├───► AudioSettings.svelte (in-game settings modal)
             │
             ├───► TTSSection.svelte (AI settings modal)
             │
             ├───► services/tts/textToSpeech.js (new TTS service)
             │
             └───► services/textToSpeech.js (legacy, reads from audioStore)
```

## Benefits

1. **Single Source of Truth**: All TTS settings stored in one place (localStorage via audioStore)
2. **No Code Duplication**: TTSSection component reuses audioStore instead of managing separate state
3. **Consistent Behavior**: Changing TTS provider in any UI updates all parts of the application
4. **Simplified Maintenance**: Only one place to update when adding new TTS providers
5. **Better User Experience**: Settings persist across different modals and features

## Testing

- Build succeeded with no compilation errors
- Type checking passes (existing warnings unrelated to refactoring)
- Package build completes successfully

## Migration Notes

- Existing TTS settings in IndexedDB will not be automatically migrated
- Users will need to reconfigure TTS settings in either modal
- Both modals now share the same TTS configuration
- `loadTTSSettings()` and `saveTTSSettings()` in aiSettings.js are deprecated but kept for backward compatibility

## Files Modified

1. `src/lib/stores/audioStore.svelte.js`
2. `src/lib/components/settings/AudioSettings.svelte`
3. `src/lib/components/settings/TTSSection.svelte`
4. `src/lib/components/AISettings.svelte`
5. `src/lib/services/aiSettings.js`
6. `src/lib/services/textToSpeech.js`

## Next Steps (Optional)

1. Consider adding a migration function to copy TTS settings from IndexedDB to localStorage on first run
2. Eventually remove deprecated functions from aiSettings.js
3. Consider consolidating textToSpeech.js with the new TTS service architecture
