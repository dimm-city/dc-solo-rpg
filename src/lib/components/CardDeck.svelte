<script>
	import { flip } from 'svelte/animate';

	import { createEventDispatcher, onMount } from 'svelte';

	export let card = null;
	let isFlipped = true;
	const dispatch = createEventDispatcher();

    onMount(()=> isFlipped = true);

    export const reset = ()=> isFlipped = !isFlipped;
	export const  drawCard = (newCard) => {
        card = newCard;
        console.log('drawing card');
		isFlipped = !isFlipped;
		dispatch('carddrawn', { card });
	}
</script>

<div class="card {isFlipped ? 'flipped' : ''}" on:click on:keyup>
	<div class="card-inner">		
		<div class="card-back">
			<h2>Draw a card</h2>
		</div>
        <div class="card-front">
			<p>{card?.description ?? ''}</p>
		</div>
	</div>
</div>

<style>
	.card {
		width: 200px;
		height: 300px;
		border: 1px solid #ccc;
		perspective: 1000px;
		cursor: pointer;
	}

	.card.flipped .card-inner {
		transform: rotateY(180deg);
	}

	.card-inner {
		width: 100%;
		height: 100%;
		transition: transform 0.6s;
		transform-style: preserve-3d;
	}

	.card-front,
	.card-back {
		position: absolute;
		width: 100%;
		height: 100%;
		backface-visibility: hidden;

	}

	.card-front {
		background-color: lightblue;
        background: var(--dc-card-front-bg);
	}

	.card-back {
        text-align: center;
        background: var(--dc-card-back-bg);		
		transform: rotateY(180deg);
	}
</style>
