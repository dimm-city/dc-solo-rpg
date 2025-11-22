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
		gap: var(--space-md);
	}

	.settings-section h3 {
		font-family: var(--font-display);
		font-size: 1.25rem;
		color: var(--color-neon-cyan);
		margin: 0;
		padding-bottom: var(--space-sm);
		border-bottom: 2px solid rgba(0, 255, 255, 0.3);
	}

	.section-description {
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.7);
		line-height: 1.5;
		margin: 0;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-sm);
	}

	.form-group label {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.9);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.form-group input,
	.form-group select {
		padding: var(--space-md);
		background: rgba(0, 0, 0, 0.4);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		color: rgba(255, 255, 255, 0.9);
		font-size: 0.9rem;
		transition: all var(--transition-base);
	}

	.form-group input:focus,
	.form-group select:focus {
		outline: none;
		border-color: var(--color-neon-cyan);
		box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
	}

	.help-text {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.5);
		line-height: 1.4;
	}

	.help-text a {
		color: var(--color-neon-cyan);
		text-decoration: none;
	}

	.help-text a:hover {
		text-decoration: underline;
	}
</style>
