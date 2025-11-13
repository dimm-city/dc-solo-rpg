<script>
	import HowToPlay from '$lib/components/HowToPlay.svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
</script>

<HowToPlay></HowToPlay>
