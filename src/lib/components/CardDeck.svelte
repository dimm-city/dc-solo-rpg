<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { gameConfig } from './WAAStore.js';

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

<div class="dc-card {isFlipped ? 'flipped' : ''} {isCleared ? 'cleared' : ''}" on:click on:keyup>
	<div class="card-inner">
		<div class="card-back">
			<slot name="card-back">
				<h2>{gameConfig.labels?.cardBackText ?? gameConfig.title}</h2>
			</slot>
		</div>
		<div class="card-front">
			<p>{card?.description ?? ''}</p>
		</div>
	</div>
</div>

<style>
	:root {
		--dc-card-width: 200px;
		--dc-card-height: 300px;
	}
	.dc-card {
		width: var(--dc-card-width);
		height: var(--dc-card-height);
		border: var(--dc-card-border);
		border-radius: var(--dc-card-border-radius);
		background-color: var(--dc-card-back-bg);
		cursor: pointer;
		perspective: 1000px;
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
		background-color: var(--dc-card-back-bg);
		text-align: center;
	}

	.card-front {
		text-align: center;
		padding: 0.25rem;
		background-color: var(--dc-card-front-bg);
		transform: rotateY(180deg);
	}
</style>
