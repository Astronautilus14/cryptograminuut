<script lang="ts">
	let { letter } = $props();

	const onClick = () => {
		console.log(`Key ${letter} clicked`);
		globalThis.window.dispatchEvent(new KeyboardEvent('keydown', { key: letter }));
	};
</script>

<button onclick={onClick}>{letter == 'Backspace' ? '⌫' : letter}</button>

<style>
	button {
		padding: 1rem 0;
		width: 100%;
		background-color: #ffface;
		border: 1px solid #f5c55e;
		border-radius: 5px;
		font-size: 1.25rem;
	}

	@media (max-width: 700px) {
		button {
			font-size: 0.75rem;
		}
	}
</style>
