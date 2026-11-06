<script>
	/**
	 * GameKeyArt - a generated duotone skyline for a game card (see utils/keyArt.js).
	 * Decorative: the card's title carries the meaning.
	 *
	 * @prop {string} seed Usually the game's slug
	 */
	import { generateKeyArt, KEY_ART_WIDTH, KEY_ART_HEIGHT } from '../../utils/keyArt.js';

	let { seed } = $props();

	const uid = $props.id();
	const art = $derived(generateKeyArt(seed));
	const id = (name) => `key-art-${uid}-${name}`;
</script>

<svg
	class="game-key-art"
	viewBox="0 0 {KEY_ART_WIDTH} {KEY_ART_HEIGHT}"
	preserveAspectRatio="xMidYMid slice"
	aria-hidden="true"
	focusable="false"
>
	<defs>
		<linearGradient id={id('sky')} x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color="#05070d" />
			<stop offset="0.55" stop-color="#0b1020" />
			<stop offset="1" stop-color={art.palette.b} stop-opacity="0.45" />
		</linearGradient>
		<linearGradient id={id('sun')} x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color={art.palette.a} />
			<stop offset="1" stop-color={art.palette.b} />
		</linearGradient>
		<linearGradient id={id('floor')} x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stop-color={art.palette.b} stop-opacity="0.22" />
			<stop offset="1" stop-color="#05070a" stop-opacity="1" />
		</linearGradient>
		<mask id={id('sun-cut')}>
			<rect width={KEY_ART_WIDTH} height={KEY_ART_HEIGHT} fill="#fff" />
			{#each art.sunStripes as stripe (stripe.y)}
				<rect x="0" y={stripe.y} width={KEY_ART_WIDTH} height={stripe.h} fill="#000" />
			{/each}
		</mask>
	</defs>

	<rect width={KEY_ART_WIDTH} height={art.horizon} fill="url(#{id('sky')})" />

	{#each art.stars as star, i (i)}
		<circle cx={star.x} cy={star.y} r={star.r} fill="#fff" opacity="0.55" />
	{/each}

	<circle
		cx={art.sun.cx}
		cy={art.sun.cy}
		r={art.sun.r}
		fill="url(#{id('sun')})"
		mask="url(#{id('sun-cut')})"
		opacity="0.92"
	/>

	<rect
		y={art.horizon}
		width={KEY_ART_WIDTH}
		height={KEY_ART_HEIGHT - art.horizon}
		fill="url(#{id('floor')})"
	/>
	<g stroke={art.palette.b} stroke-width="0.6" opacity="0.5">
		{#each art.floorRows as y (y)}
			<line x1="0" y1={y} x2={KEY_ART_WIDTH} y2={y} />
		{/each}
		{#each art.floorColumns as col, i (i)}
			<line x1={col.x1} y1={art.horizon} x2={col.x2} y2={KEY_ART_HEIGHT} />
		{/each}
	</g>

	<g fill="#04060b">
		{#each art.buildings as b, i (i)}
			<rect x={b.x} y={b.y} width={b.w} height={b.h} />
		{/each}
	</g>
	<g fill={art.palette.b} opacity="0.75">
		{#each art.buildings as b, i (i)}
			<rect x={b.x} y={b.y} width={b.w} height="0.8" />
		{/each}
	</g>
	<g fill={art.palette.a} opacity="0.8">
		{#each art.windows as w, i (i)}
			<rect x={w.x} y={w.y} width="2" height="2.5" />
		{/each}
	</g>
	<line
		x1="0"
		y1={art.horizon}
		x2={KEY_ART_WIDTH}
		y2={art.horizon}
		stroke={art.palette.a}
		stroke-width="1"
		opacity="0.85"
	/>
</svg>

<style>
	.game-key-art {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
