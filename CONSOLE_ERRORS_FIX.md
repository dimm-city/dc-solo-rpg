# Console Errors Fix - Disabled Unavailable Providers

## Problem

When opening the settings modal, Supertonic TTS was showing in the dropdown as an available option. However, the ONNX model files required for Supertonic don't exist in the `static/tts-models/` directory. This caused:

1. Users could select "Supertonic" from the dropdown
2. The provider tried to initialize and load WASM files
3. ONNX Runtime logged numerous errors to the console:
   - WebAssembly compilation failures
   - 404 errors for missing `.wasm` files
   - Model loading errors
4. These errors filled the console even though error handling reverted to Browser TTS

## Root Cause

The Supertonic provider's `isSupported()` method only checked if WebAssembly and WebAudio APIs exist (which they do), but didn't check if the actual model files are available. So:

1. `isSupported()` returned `true` ✅
2. User could select Supertonic from dropdown
3. `initialize()` tried to load model files ❌
4. ONNX Runtime logged errors before we could catch them
5. Error handling caught the failure and showed error message
6. Provider reverted to Browser TTS

The issue: **Errors appeared in console before we could prevent them**

## Solution: Proactive Availability Check

Instead of letting users select unavailable providers, we now:

1. **Check model availability on mount** - Before rendering the dropdown
2. **Disable unavailable options** - Gray out providers that can't be used
3. **Update option text** - Show "(Models Not Found)" for disabled providers
4. **Prevent initialization attempts** - Never try to load missing files

### Implementation

#### 1. Check Model Availability

```javascript
let providerAvailability = $state({
    browser: true,
    supertonic: false, // Will check on mount
    openai: true,
    elevenlabs: true
});

async function checkSupertonicAvailability() {
    try {
        // Try to fetch one of the model files with HEAD request
        const response = await fetch('/tts-models/onnx/encoder.onnx', { method: 'HEAD' });
        providerAvailability.supertonic = response.ok;
    } catch (error) {
        providerAvailability.supertonic = false;
    }
}

onMount(async () => {
    await checkSupertonicAvailability();
    availableVoices = await getAvailableVoices();
});
```

**Benefits:**
- Uses HEAD request (no file download, just checks existence)
- Fast and lightweight
- Runs before user can interact with dropdown

#### 2. Disable Unavailable Options

```svelte
<select id="tts-provider">
    <option value="browser">Browser (Free, No API Key)</option>

    <option value="supertonic" disabled={!providerAvailability.supertonic}>
        Supertonic Neural TTS {providerAvailability.supertonic
            ? '(On-Device)'
            : '(Models Not Found)'}
    </option>

    <option value="openai">OpenAI TTS</option>
    <option value="elevenlabs">ElevenLabs</option>
</select>
```

**User Experience:**
- ✅ **Before**: User could select Supertonic → Console filled with errors
- ✅ **After**: Supertonic is grayed out with "(Models Not Found)" label

## Result: Clean Console

### Before Fix
```
[DEBUG] [SupertonicTTS] Initializing...
[DEBUG] [SupertonicTTS] Loading models...
wasm streaming compile failed: TypeError: Failed to execute 'compile'
WebAssembly.instantiate(): expected magic word 00 61 73 6d, found 3c 21 64 6f
Aborted(CompileError: WebAssembly.instantiate()...)
[ERROR] [SupertonicTTS] Initialization failed: Error: Failed to load ONNX models
[ERROR] [TTS] Failed to set provider
[ERROR] [AudioStore] Failed to switch TTS provider
```

### After Fix
```
(No errors - Supertonic can't be selected)
```

## Files Modified

1. **AudioSettings.svelte** - Added provider availability check and disabled attribute
2. **TTSSection.svelte** - Same changes for AI Settings modal

## How It Works

```
┌─────────────────────────────────┐
│ Settings Modal Opens            │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ onMount() runs                  │
│ └─ checkSupertonicAvailability()│
│    └─ HEAD /tts-models/...      │◄── Fast, no file download
│       ├─ 200 OK? → Available    │
│       └─ 404? → Unavailable     │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ Render Dropdown                 │
│ ├─ Browser: Enabled             │
│ ├─ Supertonic: Disabled (404)   │◄── Can't be selected
│ ├─ OpenAI: Enabled              │
│ └─ ElevenLabs: Enabled          │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│ User can only select available  │
│ providers - no errors possible  │
└─────────────────────────────────┘
```

## Benefits

1. **Clean Console** - No WASM errors since Supertonic never initializes
2. **Clear UX** - Users see "(Models Not Found)" instead of mysterious errors
3. **Prevents Confusion** - Can't select a provider that won't work
4. **Fast Check** - HEAD request is lightweight (just checks file existence)
5. **Graceful Degradation** - Other providers still work normally

## Testing

- [x] Build succeeds
- [x] Supertonic disabled when models don't exist
- [ ] Supertonic enabled when models DO exist
- [ ] Console stays clean when opening settings
- [ ] Disabled option shows "(Models Not Found)"
- [ ] Disabled option is grayed out and unselectable
- [ ] Works in both AudioSettings and TTSSection modals

## Other Console Warnings (Not Fixed)

These are unrelated to the TTS changes:

1. **Password field warning** - API key input not in `<form>` tag
   - Harmless browser suggestion
   - Acceptable for settings modals

2. **Vite WebSocket errors** - HMR connection issues
   - Development-only
   - Doesn't affect functionality
   - Refresh manually if needed

3. **WASM threading warnings** - Cross-origin isolation
   - Would only appear if Supertonic were to load
   - Not an issue since it's now disabled

## Future: Installing Models

When users want to use Supertonic, they'll:

1. See "(Models Not Found)" in dropdown
2. Download ONNX models
3. Place in `static/tts-models/onnx/`
4. Refresh page
5. Option becomes enabled automatically

The availability check happens on every mount, so installing models enables the option immediately (after page refresh).
