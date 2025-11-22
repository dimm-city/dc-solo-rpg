# Voice Selector Fix - Provider Change Synchronization

## Problem

When changing the TTS provider in the settings modal, the voice selector dropdown did not update to show voices available for the new provider. This was because:

1. The TTS service wasn't actually switching to the new provider when settings changed
2. The `updateSettings()` method only updated internal settings but didn't call `setProvider()`
3. Voice list queries were returning voices from the old provider

## Solution

### 1. **audioStore.svelte.js** - Made Provider Switching Active

Changed `updateAudioSettings()` to:

- Detect when provider changes
- Call `ttsService.setProvider()` to actually switch the provider instance
- Reset voice selection (since voices are provider-specific)
- Revert provider on error
- Made function `async` to properly await provider switching

**Before:**

```javascript
export function updateAudioSettings(updates) {
    audioSettings = { ...audioSettings, ...updates };
    ttsService.updateSettings({ ... }); // Only updates settings object
    saveSettings();
}
```

**After:**

```javascript
export async function updateAudioSettings(updates) {
    const previousProvider = audioSettings.ttsProvider;
    audioSettings = { ...audioSettings, ...updates };

    // Actually switch provider if it changed
    if (updates.ttsProvider && updates.ttsProvider !== previousProvider) {
        await ttsService.setProvider(audioSettings.ttsProvider);
        audioSettings.ttsVoice = null; // Reset voice
    }

    ttsService.updateSettings({ ... });
    saveSettings();
}
```

### 2. **audioStore.svelte.js** - Initialize Provider on Load

Updated `loadSettings()` to:

- Set the TTS provider when loading from localStorage
- Made function `async`
- Falls back to browser TTS on error

### 3. **AudioSettings.svelte** - Handle Async Provider Change

Made `handleAudioSettingChange()` async:

- Awaits `updateAudioSettings()` to complete provider switch
- Awaits `loadVoices()` to fetch new provider's voices
- Ensures voice list updates before UI re-renders

### 4. **TTSSection.svelte** - Handle Async Provider Change

Made `handleTTSSettingChange()` async:

- Same pattern as AudioSettings
- Ensures synchronous voice list update

### 5. **Game.svelte** - Await Initialization

Updated `onMount()` to await `initializeAudioStore()`:

- Ensures provider is properly initialized before game starts
- Catches any initialization errors

## Flow After Fix

```
┌─────────────────────────────────────────┐
│  User changes TTS provider dropdown     │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  handleTTSSettingChange('ttsProvider')  │
│  ├─ await updateAudioSettings()         │
│  │  ├─ Detect provider changed          │
│  │  ├─ await setProvider(newProvider)   │◄── ACTUALLY SWITCHES
│  │  │  └─ Creates new provider instance │
│  │  └─ Reset ttsVoice to null           │
│  └─ await loadVoices()                  │◄── GETS NEW VOICES
│     └─ Calls ttsService.getVoices()     │
│        └─ Returns voices from NEW provider
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Voice selector updates with new voices │
└─────────────────────────────────────────┘
```

## Benefits

1. **Immediate Voice Update**: Voice list changes instantly when provider changes
2. **Automatic Voice Reset**: Old voice IDs don't carry over to new provider
3. **Error Handling**: Provider reverts if switching fails
4. **Consistent Behavior**: Works in both AudioSettings and TTSSection modals
5. **Type Safety**: Proper async/await prevents race conditions

## Testing Checklist

- [x] Build succeeds with no errors
- [ ] Changing provider in AudioSettings updates voice list
- [ ] Changing provider in TTSSection (AI Settings) updates voice list
- [ ] Voice selection resets when provider changes
- [ ] Browser TTS shows system voices
- [ ] Supertonic shows voice style options (F1, F2, M1, M2)
- [ ] OpenAI shows OpenAI voice options (alloy, echo, etc.)
- [ ] ElevenLabs shows voice ID text input
- [ ] Provider persists across page reloads
- [ ] Error handling works if provider fails to load

## Files Modified

1. `src/lib/stores/audioStore.svelte.js` - Made provider switching active
2. `src/lib/components/settings/AudioSettings.svelte` - Handle async updates
3. `src/lib/components/settings/TTSSection.svelte` - Handle async updates
4. `src/lib/components/Game.svelte` - Await initialization

## Technical Notes

- The key insight was that `ttsService.updateSettings()` doesn't switch providers
- Only `ttsService.setProvider()` creates a new provider instance
- The provider was previously loaded lazily on first use via `_ensureProvider()`
- Now we eagerly switch providers when settings change for immediate voice list updates
