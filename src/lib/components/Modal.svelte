<script lang="ts">
	let { showModal = $bindable(), children } = $props();

	let dialog = $state<HTMLDialogElement | null>(null); // HTMLDialogElement

	$effect(() => {
		if (showModal) dialog?.showModal();
	});
</script>

<dialog
	bind:this={dialog}
	onclose={() => (showModal = false)}
	onclick={(e) => {
		if (e.target === dialog) dialog?.close();
	}}
>
	<div>
		{@render children?.()}
		<!-- <button autofocus onclick={() => dialog?.close()}>X</button> -->
	</div>
</dialog>

<style>
	dialog {
		border-radius: 20px;
		border: 3px solid black;
		padding: 0;

		width: 90%;
		max-width: var(--max-page-width);

		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}

	dialog > div {
		padding: 1em;
	}

	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* button {
		display: block;
	} */
</style>
