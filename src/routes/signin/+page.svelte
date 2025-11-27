<script>
	import { signIn } from '@auth/sveltekit/client';
	import NeuralBackground from '$lib/components/NeuralBackground.svelte';
	import { fade } from 'svelte/transition';

	/** @type {import('./$types').PageData} */
	let { data } = $props();

	async function handleGoogleSignIn() {
		await signIn('google', { callbackUrl: '/' });
	}
</script>

<NeuralBackground />

<div class="signin-container" transition:fade={{ duration: 600 }}>
	<div class="signin-content">
		<div class="logo-section">
			<img src="/d20-150.png" alt="Dream Console Logo" class="logo-dice" />
			<h1 class="app-title">Dream Console</h1>
			<p class="tagline">Solo RPG Adventures</p>
		</div>

		<div class="signin-card">
			<h2>Sign In Required</h2>
			<p class="subtitle">Sign in with Google to access your games and save your progress.</p>

			<button class="google-signin-btn" onclick={handleGoogleSignIn}>
				<svg
					class="google-icon"
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 48 48"
					width="24"
					height="24"
				>
					<path
						fill="#FFC107"
						d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
					/>
					<path
						fill="#FF3D00"
						d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
					/>
					<path
						fill="#4CAF50"
						d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
					/>
					<path
						fill="#1976D2"
						d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
					/>
				</svg>
				Sign in with Google
			</button>

			<p class="privacy-notice">
				By signing in, you agree to our use of cookies for authentication. Your data is secure and
				we only access your basic profile information.
			</p>
		</div>
	</div>
</div>

<style>
	:global(body) {
		overflow: hidden;
	}

	.signin-container {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: var(--space-xl);
	}

	.signin-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2xl);
		max-width: 500px;
		width: 100%;
		animation: fadeInUp 0.6s ease-out;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.logo-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-md);
		text-align: center;
	}

	.logo-dice {
		width: 120px;
		height: auto;
		filter: drop-shadow(0 0 20px rgba(217, 70, 239, 0.6))
			drop-shadow(0 0 40px rgba(217, 70, 239, 0.3));
		animation: float 6s ease-in-out infinite;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-12px);
		}
	}

	.app-title {
		font-family: var(--font-display);
		font-size: clamp(2rem, 4vw, 3rem);
		font-weight: 700;
		color: var(--color-brand-yellow);
		text-shadow: var(--text-glow-yellow);
		text-transform: uppercase;
		letter-spacing: var(--letter-spacing-wider);
		margin: 0;
	}

	.tagline {
		font-size: var(--text-lg);
		color: var(--color-neon-cyan);
		text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
		margin: 0;
	}

	.signin-card {
		background: linear-gradient(135deg, rgba(10, 10, 20, 0.8), rgba(15, 15, 25, 0.7));
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 2px solid rgba(0, 255, 255, 0.3);
		border-radius: var(--dc-default-border-radius);
		padding: var(--space-2xl);
		box-shadow:
			0 0 30px rgba(0, 255, 255, 0.2),
			inset 0 0 30px rgba(0, 255, 255, 0.05);
		width: 100%;
		text-align: center;
	}

	.signin-card h2 {
		font-family: var(--font-display);
		font-size: var(--text-2xl);
		color: var(--color-neon-cyan);
		text-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
		margin: 0 0 var(--space-md) 0;
	}

	.subtitle {
		font-size: var(--text-base);
		color: rgba(255, 255, 255, 0.8);
		line-height: var(--line-height-relaxed);
		margin: 0 0 var(--space-xl) 0;
	}

	.google-signin-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-md);
		width: 100%;
		padding: var(--space-md) var(--space-xl);
		background: white;
		color: #1f1f1f;
		border: none;
		border-radius: 8px;
		font-family: var(--font-display);
		font-size: var(--text-base);
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.google-signin-btn:hover {
		background: #f8f8f8;
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
	}

	.google-signin-btn:active {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.google-icon {
		flex-shrink: 0;
	}

	.privacy-notice {
		margin-top: var(--space-lg);
		font-size: var(--text-xs);
		color: rgba(255, 255, 255, 0.6);
		line-height: var(--line-height-relaxed);
	}

	@media (max-width: 600px) {
		.signin-container {
			padding: var(--space-lg);
		}

		.logo-dice {
			width: 80px;
		}

		.app-title {
			font-size: var(--text-2xl);
		}

		.signin-card {
			padding: var(--space-xl);
		}

		.signin-card h2 {
			font-size: var(--text-xl);
		}

		.subtitle {
			font-size: var(--text-sm);
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.signin-content,
		.logo-dice {
			animation: none !important;
		}

		.google-signin-btn:hover {
			transform: none;
		}
	}
</style>
