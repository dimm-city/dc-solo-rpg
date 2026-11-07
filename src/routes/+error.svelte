<script>
	import { page } from '$app/state';
	import ErrorScreen from '$lib/components/ErrorScreen.svelte';
</script>

<ErrorScreen
	message={page.status === 404
		? 'There is nothing at this address.'
		: 'Something went wrong on the way here. Try again from the console.'}
/>
