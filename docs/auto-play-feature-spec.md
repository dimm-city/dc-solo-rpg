# Auto-Play Feature Specification

**Version:** 1.0
**Status:** Approved for Implementation
**Target:** DC Solo RPG v0.3.0

---

## Overview

Add configurable auto-play functionality that allows users to customize how much automation they want during gameplay. The system uses modular settings that can be independently enabled/disabled, allowing everything from minimal audio assistance to full hands-free gameplay.

### Key Design Principles

1. **Granular Control**: Each automation feature is a separate toggle
2. **Progressive Enhancement**: All settings default to OFF (preserves existing gameplay)
3. **Pluggable TTS**: Support multiple TTS providers (Web Speech API, future AI TTS)
4. **User-Configurable Timing**: Global auto-advance delay setting
5. **Accessibility First**: Designed to help vision-impaired users and multitaskers

---

## User Settings

### Audio Settings

| Setting             | Type    | Default     | Description                                                 |
| ------------------- | ------- | ----------- | ----------------------------------------------------------- |
| `autoReadCards`     | boolean | `false`     | Auto-read card content when drawn                           |
| `autoReadPrompts`   | boolean | `false`     | Auto-read screen prompts and instructions                   |
| `autoAnnounceRolls` | boolean | `false`     | TTS announces dice results                                  |
| `readingSpeed`      | enum    | `'normal'`  | TTS reading speed: `'slow'`, `'normal'`, `'fast'`           |
| `ttsProvider`       | enum    | `'browser'` | TTS provider: `'browser'`, `'elevenlabs'`, `'openai'`, etc. |
| `ttsVoice`          | string  | `null`      | Selected voice (provider-specific)                          |

### Gameplay Settings

| Setting                    | Type    | Default    | Description                                                |
| -------------------------- | ------- | ---------- | ---------------------------------------------------------- |
| `autoRollDice`             | boolean | `false`    | Auto-trigger all dice rolls                                |
| `autoContinueAfterReading` | boolean | `false`    | Auto-click "Continue" after TTS finishes                   |
| `autoAdvanceDelay`         | number  | `2000`     | Delay in milliseconds before auto-advancing (500-10000ms)  |
| `autoHandleJournaling`     | enum    | `'manual'` | Journal handling: `'manual'`, `'skip'`, `'timed'`          |
| `journalPauseTime`         | number  | `10000`    | Time to wait before auto-continuing on journal screen (ms) |

---

## TTS Provider Architecture

### Provider Interface

All TTS providers must implement this interface:

```javascript
interface TTSProvider {
  /**
   * Initialize the provider with configuration
   * @param {Object} config - Provider-specific configuration
   * @returns {Promise<void>}
   */
  initialize(config): Promise<void>

  /**
   * Speak the given text
   * @param {string} text - Text to speak
   * @param {Object} options - Speaking options (rate, pitch, voice, etc.)
   * @returns {Promise<void>} - Resolves when speaking completes
   */
  speak(text, options): Promise<void>

  /**
   * Stop current speech
   * @returns {void}
   */
  stop(): void

  /**
   * Pause current speech
   * @returns {void}
   */
  pause(): void

  /**
   * Resume paused speech
   * @returns {void}
   */
  resume(): void

  /**
   * Check if provider is currently speaking
   * @returns {boolean}
   */
  isSpeaking(): boolean

  /**
   * Get available voices for this provider
   * @returns {Promise<Array<{id: string, name: string, language: string}>>}
   */
  getVoices(): Promise<Array<Voice>>

  /**
   * Get provider display name
   * @returns {string}
   */
  getName(): string
}
```

### Provider Implementations

#### 1. Browser TTS Provider (Default)

Uses Web Speech API (`window.speechSynthesis`).

**Features:**

- Free, no API key required
- Works offline
- Voice quality varies by OS/browser
- Available voices depend on system

**Configuration:**

```javascript
{
  provider: 'browser',
  voice: null, // null = system default
  rate: 1.0,   // 0.1 to 10
  pitch: 1.0   // 0 to 2
}
```

#### 2. Placeholder for Future Providers

**ElevenLabs Provider:**

```javascript
{
  provider: 'elevenlabs',
  apiKey: 'user-api-key',
  voiceId: 'voice-id',
  modelId: 'eleven_monolingual_v1'
}
```

**OpenAI TTS Provider:**

```javascript
{
  provider: 'openai',
  apiKey: 'user-api-key',
  model: 'tts-1',
  voice: 'alloy'
}
```

### Provider Registry

```javascript
// src/lib/services/tts/providers/index.js
const TTS_PROVIDERS = {
	browser: BrowserTTSProvider
	// Future:
	// elevenlabs: ElevenLabsProvider,
	// openai: OpenAIProvider,
};
```

---

## Implementation Plan

### Phase 1: Core Infrastructure

#### Step 1: TTS Service Layer

**File:** `src/lib/services/tts/textToSpeech.js`

- Export main TTS service class
- Provider registry and factory
- Unified speak() API that returns promises
- Settings integration

**File:** `src/lib/services/tts/providers/BaseTTSProvider.js`

- Abstract base class with interface definition
- Common utility methods
- Error handling

**File:** `src/lib/services/tts/providers/BrowserTTSProvider.js`

- Web Speech API implementation
- Promise wrapper for speechSynthesis events
- Voice management

#### Step 2: Audio Store

**File:** `src/lib/stores/audioStore.svelte.js`

- Audio/gameplay settings state (Svelte 5 runes)
- TTS service instance
- Current speaking state
- Getter functions for settings

#### Step 3: Settings Persistence

**Modify:** `src/lib/stores/gameStore.svelte.js`

- Add audio/gameplay settings to game state
- Auto-save settings to localStorage/IndexedDB
- Load settings on game init

### Phase 2: Auto-Play Logic

#### Step 4: Auto-Roll Dice

**Modify:** `src/lib/components/GameScreen.svelte`

- Watch for dice screens: `initialDamageRoll`, `rollForTasks`, `failureCheck`, `successCheck`
- If `autoRollDice` enabled, auto-trigger roll after `autoAdvanceDelay`
- Show visual indicator (e.g., "Auto-rolling in 2s...")
- Cancel if user clicks manually

#### Step 5: Auto-Continue After Reading

**Modify:** `src/lib/components/GameScreen.svelte`

- After TTS completes, wait `autoAdvanceDelay` ms
- Auto-click "Continue" button
- Show countdown indicator
- Cancel if user clicks manually

#### Step 6: Auto-Announce Dice Results

**Modify:** `src/lib/components/GameScreen.svelte`

- After dice animation completes, check `autoAnnounceRolls`
- Generate result text (e.g., "You rolled a 15. Taking 7 damage.")
- Call TTS service
- Chain with auto-continue if enabled

#### Step 7: Auto-Read Cards

**Modify:** `src/lib/components/CardDeck.svelte`

- After card reveal animation (`animationStage === 'revealed'`)
- If `autoReadCards` enabled, speak card description + story
- Chain with auto-continue if enabled

#### Step 8: Auto-Read Prompts

**Modify:** `src/lib/components/GameScreen.svelte`

- For screens: `showIntro`, `startRound`, prompts
- If `autoReadPrompts` enabled, speak screen text
- Chain with auto-continue if enabled

#### Step 9: Journal Auto-Handling

**Modify:** `src/lib/components/JournalEntry.svelte`

- If `autoHandleJournaling === 'skip'`, immediately save and continue
- If `autoHandleJournaling === 'timed'`:
  - Show countdown timer (`journalPauseTime` ms)
  - Auto-continue when timer expires
  - Cancel timer if user interacts
- If `'manual'`, no changes

### Phase 3: User Interface

#### Step 10: Settings Panel UI

**New File:** `src/lib/components/settings/AudioSettings.svelte`

- Audio settings section:
  - Auto-read cards toggle
  - Auto-read prompts toggle
  - Auto-announce rolls toggle
  - Reading speed selector
  - TTS provider selector
  - Voice selector (dynamically populated)

**New File:** `src/lib/components/settings/GameplaySettings.svelte`

- Gameplay automation section:
  - Auto-roll dice toggle
  - Auto-continue after reading toggle
  - Auto-advance delay slider (500-10000ms with visual feedback)
  - Journal handling mode selector
  - Journal pause time slider

**New File:** `src/lib/components/settings/SettingsModal.svelte`

- Modal container with tabs:
  - Audio tab
  - Gameplay tab
  - (Existing settings tabs if any)
- Save/Cancel buttons
- Settings preview/test

#### Step 11: Settings Access

**Modify:** `src/lib/components/GameScreen.svelte` or main UI

- Add settings gear icon/button
- Open SettingsModal on click
- Persist settings immediately on change

### Phase 4: Testing & Polish

#### Step 12: Unit Tests

**New Files:**

- `src/lib/services/tts/BrowserTTSProvider.test.js`
- `src/lib/stores/audioStore.test.js`

Test coverage:

- TTS provider interface compliance
- Promise resolution on speak completion
- Settings persistence
- Auto-advance timing logic

#### Step 13: Integration Testing

**New File:** `src/lib/components/AutoPlay.integration.test.js`

Test scenarios:

- Full auto-play (all settings enabled)
- Partial auto-play combinations
- Manual override (user clicks during auto-advance)
- Settings changes mid-game

#### Step 14: Polish & UX

- Visual indicators for auto-advancing (countdown timers, progress bars)
- Accessibility labels (ARIA attributes)
- Keyboard shortcuts (e.g., Space to toggle auto-play)
- Mobile-friendly controls

---

## Technical Implementation Details

### Auto-Advance Pattern

```javascript
// Reusable auto-advance helper
async function autoAdvanceIfEnabled(ttsText = null, buttonRef = null) {
	const settings = getAudioSettings();

	// Step 1: TTS if text provided and enabled
	if (ttsText && (settings.autoReadCards || settings.autoReadPrompts)) {
		await ttsService.speak(ttsText);
	}

	// Step 2: Auto-continue if enabled
	if (settings.autoContinueAfterReading && buttonRef) {
		const delay = settings.autoAdvanceDelay;

		// Show countdown indicator
		showCountdown(delay);

		// Wait for delay (cancellable)
		await cancellableDelay(delay);

		// Click button programmatically
		buttonRef.click();
	}
}
```

### Cancellable Delays

```javascript
let autoAdvanceTimer = null;

function cancellableDelay(ms) {
	return new Promise((resolve) => {
		autoAdvanceTimer = setTimeout(resolve, ms);
	});
}

function cancelAutoAdvance() {
	if (autoAdvanceTimer) {
		clearTimeout(autoAdvanceTimer);
		autoAdvanceTimer = null;
	}
}

// Cancel on user interaction
button.addEventListener('click', cancelAutoAdvance);
```

### TTS Promise Wrapper (Browser)

```javascript
function speak(text, options = {}) {
	return new Promise((resolve, reject) => {
		const utterance = new SpeechSynthesisUtterance(text);

		utterance.rate = options.rate || 1.0;
		utterance.pitch = options.pitch || 1.0;
		if (options.voice) utterance.voice = options.voice;

		utterance.onend = () => resolve();
		utterance.onerror = (error) => reject(error);

		window.speechSynthesis.speak(utterance);
	});
}
```

### Reading Speed Mapping

```javascript
const READING_SPEEDS = {
	slow: 0.75,
	normal: 1.0,
	fast: 1.5
};
```

### Auto-Advance Delay Presets

```javascript
const DELAY_PRESETS = {
	instant: 500, // 0.5s
	quick: 1000, // 1s
	normal: 2000, // 2s (default)
	relaxed: 4000, // 4s
	slow: 6000, // 6s
	custom: null // User-defined
};
```

---

## State Schema Updates

### gameStore.svelte.js

```javascript
let gameState = $state({
	// ... existing state ...

	settings: {
		audio: {
			autoReadCards: false,
			autoReadPrompts: false,
			autoAnnounceRolls: false,
			readingSpeed: 'normal',
			ttsProvider: 'browser',
			ttsVoice: null
		},
		gameplay: {
			autoRollDice: false,
			autoContinueAfterReading: false,
			autoAdvanceDelay: 2000,
			autoHandleJournaling: 'manual',
			journalPauseTime: 10000
		}
	}
});
```

---

## User Experience Flows

### Flow 1: Full Auto-Play (All Settings Enabled)

```
User clicks "Play"
  ↓
Auto-reads intro → waits 2s → auto-continues
  ↓
Auto-reads "Roll for initial damage" → waits 2s → auto-rolls
  ↓
Dice animation plays → announces "You rolled 12. Taking 12 damage." → waits 2s → auto-continues
  ↓
Auto-reads "Round 1 begins" → waits 2s → auto-continues
  ↓
Auto-reads "Roll to see how many cards" → waits 2s → auto-rolls
  ↓
Announces "You rolled 7. Draw 1 card." → waits 2s → auto-confirms
  ↓
Card auto-draws → auto-reads card story → waits 2s → auto-continues
  ↓
[If Challenge] Auto-reads "Roll for damage" → auto-rolls → announces result → continues
  ↓
Shows "Take a moment to reflect..." → 10s countdown → auto-continues
  ↓
Loop continues...
```

### Flow 2: Audio Only (No Auto-Advance)

```
User clicks "Begin Journey"
  ↓
TTS reads intro aloud
  ↓
User manually clicks "Continue"
  ↓
TTS reads "Roll for initial damage"
  ↓
User manually clicks to roll
  ↓
Dice animation → TTS announces result
  ↓
User manually clicks "Continue"
  ↓
... and so on
```

### Flow 3: Auto-Dice Only

```
User clicks "Begin Journey"
  ↓
User manually clicks "Continue"
  ↓
Screen shows "Rolling in 2s..." → auto-rolls after 2s
  ↓
Dice animation plays
  ↓
User manually clicks "Continue"
  ↓
... and so on
```

---

## Accessibility Considerations

1. **Screen Reader Support**
   - All auto-advance countdowns have ARIA live regions
   - Settings have proper labels and descriptions

2. **Keyboard Navigation**
   - All controls keyboard accessible
   - Escape key cancels auto-advance
   - Space bar toggles auto-play on/off

3. **Visual Indicators**
   - Countdown timers for auto-advance
   - "Auto" badge on buttons that will auto-click
   - Settings summary display on game screen

4. **Reduced Motion**
   - Respect `prefers-reduced-motion` CSS media query
   - Option to disable dice animations when auto-playing

---

## Future Enhancements

### Phase 2 Features (Post-Launch)

1. **AI TTS Providers**
   - ElevenLabs integration
   - OpenAI TTS integration
   - Voice cloning support

2. **Advanced Settings**
   - Per-card-type read settings (e.g., only read Challenge cards)
   - Variable delay based on text length
   - Background music/ambiance during auto-play

3. **Narration Enhancements**
   - Custom narration scripts (add "You draw a card..." transitions)
   - Emotion/tone control for AI voices
   - Multi-voice support (narrator vs character voices)

4. **Sharing & Presets**
   - Save/load auto-play presets
   - Share presets with other players
   - Game-specific recommended settings

---

## Success Metrics

1. **Functionality**
   - ✅ All settings work independently
   - ✅ All settings work in combination
   - ✅ Game completes successfully with full auto-play
   - ✅ Manual override works at all points

2. **Performance**
   - ✅ TTS latency < 500ms
   - ✅ No UI blocking during speech
   - ✅ Smooth transitions between states

3. **Usability**
   - ✅ Settings are discoverable
   - ✅ Settings are intuitive
   - ✅ Visual feedback for all auto-actions
   - ✅ Easy to disable mid-game

---

## Implementation Checklist

### Core Infrastructure

- [ ] Create TTS provider base class
- [ ] Implement Browser TTS provider
- [ ] Create TTS service with provider registry
- [ ] Create audioStore with settings state
- [ ] Add settings to gameStore
- [ ] Implement settings persistence

### Auto-Play Logic

- [ ] Auto-roll dice implementation
- [ ] Auto-continue after reading implementation
- [ ] Auto-announce dice results
- [ ] Auto-read cards on reveal
- [ ] Auto-read prompts on screen change
- [ ] Journal auto-handling (skip/timed)

### User Interface

- [ ] Audio settings panel
- [ ] Gameplay settings panel
- [ ] Settings modal container
- [ ] Auto-advance countdown indicators
- [ ] Settings access button in game UI

### Testing & Polish

- [ ] Unit tests for TTS providers
- [ ] Unit tests for audioStore
- [ ] Integration tests for auto-play flows
- [ ] Manual testing of all combinations
- [ ] Accessibility audit
- [ ] Mobile testing

### Documentation

- [ ] Update README with auto-play features
- [ ] Add auto-play usage guide
- [ ] Update game-config.md if needed
- [ ] Add TTS provider documentation

---

## File Structure

```
src/lib/
├── services/
│   └── tts/
│       ├── textToSpeech.js              # Main TTS service
│       ├── providers/
│       │   ├── BaseTTSProvider.js       # Abstract base class
│       │   ├── BrowserTTSProvider.js    # Web Speech API impl
│       │   └── index.js                 # Provider registry
│       └── textToSpeech.test.js
│
├── stores/
│   ├── audioStore.svelte.js             # Audio settings state
│   └── audioStore.test.js
│
├── components/
│   ├── settings/
│   │   ├── SettingsModal.svelte         # Main settings container
│   │   ├── AudioSettings.svelte         # Audio settings panel
│   │   └── GameplaySettings.svelte      # Gameplay settings panel
│   │
│   ├── GameScreen.svelte                # [MODIFIED] Add auto-play logic
│   ├── CardDeck.svelte                  # [MODIFIED] Add auto-read
│   └── JournalEntry.svelte              # [MODIFIED] Add timer
│
└── tests/
    └── integration/
        └── AutoPlay.integration.test.js
```

---

**End of Specification**
