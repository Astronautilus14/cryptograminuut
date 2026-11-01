<script lang="ts">
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';
	import './main.css';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<style>
		@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Jua&display=swap');
	</style>
</svelte:head>

<main>
	<nav>
		<div class="content">
			<h3>CRYPTOGRAMINUUT</h3>
		</div>
	</nav>
	<div class="content">
		{@render children()}
	</div>
</main>

<style>
	nav {
		background-color: #f5c55e;
	}

	nav h3 {
		font-family: 'Jua', sans-serif;
	}

	.content {
		max-width: var(--max-page-width);
		margin: 0 auto;
		padding: 1rem;
	}
</style>
