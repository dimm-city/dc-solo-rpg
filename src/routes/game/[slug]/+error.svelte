<script>
	import { page } from '$app/state';
	import ErrorScreen from '$lib/components/ErrorScreen.svelte';
</script>

<ErrorScreen
	message={page.status === 400
		? `The game file for “${page.params.slug}” could not be read.`
		: `We couldn't find a game called “${page.params.slug}”.`}
/>
