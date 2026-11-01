<script lang="ts">
	import Key from '#lib/components/Key.svelte';
</script>

<div class="keyboard">
	<div class="row">
		<Key letter="Q" />
		<Key letter="W" />
		<Key letter="E" />
		<Key letter="R" />
		<Key letter="T" />
		<Key letter="Y" />
		<Key letter="U" />
		<Key letter="I" />
		<Key letter="O" />
		<Key letter="P" />
	</div>

	<div class="row">
		<Key letter="A" />
		<Key letter="S" />
		<Key letter="D" />
		<Key letter="F" />
		<Key letter="G" />
		<Key letter="H" />
		<Key letter="J" />
		<Key letter="K" />
		<Key letter="L" />
	</div>

	<div class="row">
		<Key letter="Z" />
		<Key letter="X" />
		<Key letter="C" />
		<Key letter="V" />
		<Key letter="B" />
		<Key letter="N" />
		<Key letter="M" />
		<Key letter="Backspace" />
	</div>
</div>

<style>
	.keyboard {
		position: fixed;
		bottom: 0.25rem;
		width: min(calc(100% - 2rem), var(--max-page-width));

		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.row {
		display: flex;
		justify-content: space-between;
		gap: 0.25rem;
		width: 100%;
	}
</style>
