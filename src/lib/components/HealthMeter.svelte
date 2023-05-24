<script>
	import { gameStore } from './WAAStore.js';
	export let color1 = 'green';
	export let color2 = 'orange';
	export let color3 = 'red';

	let health = 100;
	$: health = Math.floor(($gameStore.tower / 54) * 100);
	$: color = health > 66 ? color1 : health > 33 ? color2 : color3;
</script>

<div class="health-meter">
	<svg width="100%" height="100%" viewBox="0 0 100 100">
		<polygon points="50 1 95 25 95 75 50 99 5 75 5 25" fill={color}/>
		<mask id="health-mask">
			<rect
				class="mask-rect"
				x="0"
				y="0"
				width="100"
				height={100 - health}
				fill="{color}"
				style="transition: fill 1s linear;"
			/>
		</mask>
		<polygon points="50 1 95 25 95 75 50 99 5 75 5 25" mask="url(#health-mask)"   class="dc-health-meter-bg"/>
	</svg>
	<span class="health-score">{health}</span>
</div>

<style>
	.mask-rect {
		transition: height 1s linear;
	}

	.health-meter {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.health-score {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 2em;
		color: white;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
	}
</style>
