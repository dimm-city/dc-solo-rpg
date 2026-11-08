<!--
 * AIProviderSection - AI story summary provider settings
 *
 * Provider, API key, model (one current default per provider) and a "Test key" button that
 * makes one tiny call and says in plain words whether the key works. Uses the shared cm-*
 * form styles from ContentModal.
 *
 * @component
 * @example
 * <AIProviderSection
 *   bind:aiProvider={aiProvider}
 *   bind:aiApiKey={aiApiKey}
 *   bind:aiModel={aiModel}
 *   bind:customEndpoint={customEndpoint}
 * />
 -->

<script>
	import {
		CLAUDE_MODELS,
		DEFAULT_MODELS,
		testAIConnection
	} from '../../services/storyGeneration.js';

	let {
		aiProvider = $bindable('anthropic'),
		aiApiKey = $bindable(''),
		aiModel = $bindable(DEFAULT_MODELS.anthropic),
		customEndpoint = $bindable('')
	} = $props();

	/** A format hint for the key field (a placeholder is never the label); none for the rest */
	const KEY_PLACEHOLDERS = { anthropic: 'sk-ant-…', openai: 'sk-…' };

	/** @type {{ok: boolean, message: string} | null} */
	let testResult = $state(null);
	let testing = $state(false);
	let resultElement = $state();
	// Results belong to the settings they were made with; a newer test wins
	let testRun = 0;

	function changeProvider(event) {
		aiProvider = event.currentTarget.value;
		// Each provider has its own model list; never carry a Claude ID over to OpenAI
		aiModel = DEFAULT_MODELS[aiProvider] ?? '';
		testResult = null;
	}

	function clearResult() {
		testResult = null;
	}

	async function testKey() {
		const run = ++testRun;
		testing = true;
		testResult = null;
		const result = await testAIConnection({
			provider: aiProvider,
			apiKey: aiApiKey,
			model: aiModel,
			customEndpoint
		});
		if (run !== testRun) return;
		testResult = result;
		testing = false;
		// On phones the result line can sit under the dialog's footer; bring it into view
		requestAnimationFrame(() => resultElement?.scrollIntoView?.({ block: 'nearest' }));
	}
</script>

<section class="cm-section" aria-labelledby="ai-provider-heading">
	<h3 class="cm-section-title" id="ai-provider-heading">AI provider</h3>
	<p class="cm-section-desc">
		Story summaries use your own API key. It stays in this browser and is sent only to the provider
		you choose.
	</p>

	<div class="cm-rows">
		<div class="cm-row">
			<label class="cm-label" for="ai-provider">Provider</label>
			<select id="ai-provider" class="cm-control" value={aiProvider} onchange={changeProvider}>
				<option value="anthropic">Anthropic (Claude)</option>
				<option value="openai">OpenAI</option>
				<option value="custom">Custom endpoint</option>
			</select>
		</div>

		{#if aiProvider === 'custom'}
			<div class="cm-row">
				<label class="cm-label" for="custom-endpoint">Endpoint URL</label>
				<input
					id="custom-endpoint"
					class="cm-control"
					type="url"
					bind:value={customEndpoint}
					oninput={clearResult}
					placeholder="https://your-api.example.com/generate"
				/>
			</div>
		{/if}

		<div class="cm-row">
			<div>
				<label class="cm-label" for="ai-api-key">API key</label>
				<p class="cm-help" id="ai-api-key-help">
					{#if aiProvider === 'anthropic'}
						Create one at <a
							href="https://platform.claude.com/settings/keys"
							target="_blank"
							rel="noopener">platform.claude.com</a
						>.
					{:else if aiProvider === 'openai'}
						Create one at <a
							href="https://platform.openai.com/api-keys"
							target="_blank"
							rel="noopener">platform.openai.com</a
						>.
					{:else}
						Sent as a Bearer token to your endpoint.
					{/if}
					Stored only in this browser.
				</p>
			</div>
			<input
				id="ai-api-key"
				class="cm-control"
				type="password"
				autocomplete="off"
				spellcheck="false"
				aria-describedby="ai-api-key-help"
				bind:value={aiApiKey}
				oninput={clearResult}
				placeholder={KEY_PLACEHOLDERS[aiProvider]}
			/>
		</div>

		{#if aiProvider === 'anthropic'}
			<div class="cm-row">
				<label class="cm-label" for="ai-model">Model</label>
				<select id="ai-model" class="cm-control" bind:value={aiModel} onchange={clearResult}>
					{#each CLAUDE_MODELS as model (model.id)}
						<option value={model.id}>{model.label}</option>
					{/each}
				</select>
			</div>
		{:else if aiProvider === 'openai'}
			<div class="cm-row">
				<div>
					<label class="cm-label" for="ai-model">Model</label>
					<p class="cm-help" id="ai-model-help">
						Any chat model your key can use. Test key checks that it exists.
					</p>
				</div>
				<input
					id="ai-model"
					class="cm-control"
					type="text"
					autocomplete="off"
					spellcheck="false"
					aria-describedby="ai-model-help"
					bind:value={aiModel}
					oninput={clearResult}
					placeholder={DEFAULT_MODELS.openai}
				/>
			</div>
		{/if}
	</div>

	<div class="key-test">
		<button
			type="button"
			class="cm-btn test-button"
			onclick={testKey}
			disabled={testing}
			aria-describedby="ai-test-result"
		>
			{testing ? 'Testing…' : 'Test key'}
		</button>
		<p
			bind:this={resultElement}
			id="ai-test-result"
			class="test-result"
			class:ok={testResult?.ok}
			class:failed={testResult && !testResult.ok}
			role="status"
			aria-live="polite"
		>
			{#if testResult}
				<span class="result-mark" aria-hidden="true">{testResult.ok ? '✓' : '!'}</span>
				<span>{testResult.message}</span>
			{/if}
		</p>
	</div>
</section>

<style>
	.key-test {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 16px;
		margin-top: 8px;
	}

	.test-button {
		flex: 0 0 auto;
		min-width: 140px;
	}

	.test-button:disabled {
		opacity: 0.6;
		cursor: progress;
	}

	.test-result {
		flex: 1 1 240px;
		display: flex;
		align-items: baseline;
		gap: 8px;
		margin: 0;
		min-height: 1.5em;
		font-size: 0.9375rem;
		line-height: 1.5;
		color: #d5dfeb;
	}

	.test-result.ok {
		color: #7dffb3;
	}

	.test-result.failed {
		color: #ff8fa3;
	}

	.result-mark {
		flex-shrink: 0;
		font-weight: 600;
	}

	.cm-help a {
		color: var(--color-neon-cyan, #00ffff);
		text-decoration: underline;
	}
</style>
