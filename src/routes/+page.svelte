<script lang="ts">
	import Clue from '#lib/components/Clue.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Clue clue={data.clue} isDaily={true} />
