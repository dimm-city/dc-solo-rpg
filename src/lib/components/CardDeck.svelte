<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { gameStore } from '../stores/WAAStore.js';

	export let card = null;
	let isFlipped = false;
	let isCleared = false;
	const dispatch = createEventDispatcher();

	onMount(() => {
		isFlipped = false;
		isCleared = false;
	});

	export const reset = () => {
		isCleared = true;
		isFlipped = !isFlipped;
	};
	export const drawCard = (newCard) => {
		isCleared = false;
		card = newCard;
		console.log('drawing card');
		isFlipped = !isFlipped;
		dispatch('carddrawn', { card });
	};
</script>

<div
	class="dc-card {isFlipped ? 'flipped' : ''} {isCleared ? 'cleared' : ''}"
	on:click
	on:keyup
	role="button"
	tabindex="0"
>
	<div class="card-inner">
		<div class="card-back">
			<slot name="card-back">
				<h2>{$gameStore.config.labels?.cardBackText ?? $gameStore.config.title}</h2>
			</slot>
		</div>
		<div class="card-front">
			{#if card}
				<p>{card?.description ?? ''}</p>
				<small>{card.card} {card.suit}</small>
			{/if}
		</div>
	</div>
</div>

<style>
	:root {
		--dc-card-width: auto;
		--dc-card-height: 300px;
	}
	.dc-card {
		width: var(--dc-card-width);
		height: var(--dc-card-height);
		border: var(--dc-card-border);
		border-radius: var(--dc-card-border-radius);
		background: var(--dc-card-back-bg);
		aspect-ratio: 2/3;
		cursor: pointer;
		perspective: 1000px;
	}

	@media (max-width: 768px) {
		:root {
			--dc-card-width: auto;
			--dc-card-height: 220px;
		}
	}

	@media (max-width: 450px) {
		:root {
			--dc-card-width: auto;
			--dc-card-height: 250px;
		}
	}

	.dc-card.flipped .card-inner {
		transform: rotateY(-180deg) translate3D(50px, 50px, 0);
	}
	/* .card.cleared .card-inner {
		transform: rotateY(-180deg) translate3D(100svw, 50px, 0);
	} */

	.card-inner {
		width: 100%;
		height: 100%;
		transition: transform 0.6s;
		transform-style: preserve-3d;
	}

	.card-front,
	.card-back {
		position: fixed;
		width: 100%;
		height: 100%;
		backface-visibility: hidden;
		border: var(--dc-card-border);
		border-radius: var(--dc-card-border-radius);
	}

	.card-back {
		display: grid;
		height: 100%;
		align-items: center;
		color: var(--dc-card-back-color);
		background: var(--dc-card-back-bg);
		text-align: center;
	}

	.card-front {
		text-align: center;
		padding: 0.25rem;
		padding-top: 1rem;
		background-color: var(--dc-card-front-bg);
		color: var(--dc-card-front-color);
		transform: rotateY(180deg);
	}
	.card-front small {
		position: absolute;
		bottom: 0.25rem;
		right: 0.5rem;
	}
</style>
