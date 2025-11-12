<script>
	import '../styles.css';
	import { onNavigate } from '$app/navigation';

	let { children } = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<div>
	{@render children()}
</div>

<style>
	/* View Transition API styles for smooth page transitions */
	:global(::view-transition-old(root)),
	:global(::view-transition-new(root)) {
		animation-duration: 0.4s;
	}

	:global(::view-transition-old(root)) {
		animation-name: fade-out-scale;
	}

	:global(::view-transition-new(root)) {
		animation-name: fade-in-rise;
	}

	@keyframes fade-out-scale {
		from {
			opacity: 1;
			transform: scale(1);
		}
		to {
			opacity: 0;
			transform: scale(0.95);
		}
	}

	@keyframes fade-in-rise {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Respect reduced motion preferences */
	@media (prefers-reduced-motion: reduce) {
		:global(::view-transition-old(root)),
		:global(::view-transition-new(root)) {
			animation: none !important;
		}
	}
</style>
