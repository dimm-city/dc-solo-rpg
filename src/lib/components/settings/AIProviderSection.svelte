<!--
 * AIProviderSection - AI Provider configuration section
 *
 * Provides UI for configuring AI story generation provider settings
 *
 * @component ⭐ REUSABLE
 * @example
 * <AIProviderSection
 *   bind:aiProvider={aiProvider}
 *   bind:aiApiKey={aiApiKey}
 *   bind:aiModel={aiModel}
 *   bind:customEndpoint={customEndpoint}
 * />
 -->

<script>
	let {
		aiProvider = $bindable('anthropic'),
		aiApiKey = $bindable(''),
		aiModel = $bindable('claude-3-5-sonnet-20241022'),
		customEndpoint = $bindable('')
	} = $props();
</script>

<section class="settings-section">
	<h3>AI Provider</h3>
	<p class="section-description">
		Choose your AI provider for story generation. You'll need an API key from the selected provider.
	</p>

	<div class="form-group">
		<label for="ai-provider">Provider</label>
		<select id="ai-provider" bind:value={aiProvider}>
			<option value="anthropic">Anthropic (Claude)</option>
			<option value="openai">OpenAI (GPT-4)</option>
			<option value="custom">Custom Endpoint</option>
		</select>
	</div>

	<div class="form-group">
		<label for="ai-api-key">API Key</label>
		<input id="ai-api-key" type="password" bind:value={aiApiKey} placeholder="Enter your API key" />
		<small class="help-text">
			{#if aiProvider === 'anthropic'}
				Get your API key from <a
					href="https://console.anthropic.com/"
					target="_blank"
					rel="noopener">console.anthropic.com</a
				>
			{:else if aiProvider === 'openai'}
				Get your API key from <a
					href="https://platform.openai.com/api-keys"
					target="_blank"
					rel="noopener">platform.openai.com</a
				>
			{:else}
				Enter your custom API endpoint URL below
			{/if}
		</small>
	</div>

	{#if aiProvider === 'anthropic'}
		<div class="form-group">
			<label for="ai-model">Model</label>
			<select id="ai-model" bind:value={aiModel}>
				<option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet (Recommended)</option>
				<option value="claude-3-opus-20240229">Claude 3 Opus</option>
				<option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
			</select>
		</div>
	{:else if aiProvider === 'openai'}
		<div class="form-group">
			<label for="ai-model">Model</label>
			<select id="ai-model" bind:value={aiModel}>
				<option value="gpt-4o">GPT-4o (Recommended)</option>
				<option value="gpt-4-turbo">GPT-4 Turbo</option>
				<option value="gpt-4">GPT-4</option>
			</select>
		</div>
	{/if}

	{#if aiProvider === 'custom'}
		<div class="form-group">
			<label for="custom-endpoint">Custom Endpoint URL</label>
			<input
				id="custom-endpoint"
				type="url"
				bind:value={customEndpoint}
				placeholder="https://your-api.example.com/generate"
			/>
		</div>
	{/if}
</section>

<style>
	.settings-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-lg, 1.5rem);
	}

	/* Display face is for 24px+ titles only; section headings use the body face */
	.settings-section h3 {
		font-family: var(--font-body, 'Inter', sans-serif);
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-neon-cyan);
		margin: 0;
	}

	.section-description {
		font-size: 0.9375rem;
		color: #b8c5d6;
		line-height: 1.5;
		margin: 0;
		max-width: 65ch;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.form-group label {
		font-size: 1rem;
		font-weight: 600;
		line-height: 1.4;
		color: #fff;
	}

	.form-group input,
	.form-group select {
		box-sizing: border-box;
		min-height: 44px;
		padding: 10px 14px;
		background: #07101a;
		border: 1px solid #6a87a3;
		border-radius: 4px;
		color: #fff;
		font-family: inherit;
		font-size: 1rem;
	}

	.form-group input:focus-visible,
	.form-group select:focus-visible {
		outline: 2px solid var(--color-neon-cyan);
		outline-offset: 2px;
		border-color: var(--color-neon-cyan);
	}

	.help-text {
		font-size: 0.875rem;
		color: #aebbcc;
		line-height: 1.5;
	}

	.help-text a {
		color: var(--color-neon-cyan);
		text-decoration: underline;
	}
</style>
