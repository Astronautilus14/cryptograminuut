<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let selected = $state(0);
	let input = $state<string[]>(Array.from({ length: data.answer.length }, () => ' '));

	let invisibleInput = $state<HTMLInputElement | null>(null);

	function handleKeydown(event: KeyboardEvent) {
		if (selected >= data.answer.length) return;

		if (event.key === 'Backspace') {
			input[selected] = ' ';
			selected = Math.max(selected - 1, 0);
			return;
		}

		if (event.key === 'ArrowLeft') {
			selected = Math.max(selected - 1, 0);
			return;
		}

		if (event.key === 'ArrowRight' || event.key === ' ') {
			selected = Math.min(selected + 1, data.answer.length - 1);
			return;
		}

		// Check if key is a letter
		if (!/^[a-zA-Z]$/.test(event.key)) return;

		input[selected] = event.key.length === 1 ? event.key : ' ';
		selected = Math.min(selected + 1, data.answer.length - 1);
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="author">
	<p>Auteur: {data.author}</p>
</div>

<div class="clue">
	<p>{data.clue}</p>
</div>

<div class="input">
	<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
	{#each data.answer as _, i (i)}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class={`letter ${selected === i ? 'selected' : ''}`}
			onclick={() => {
				selected = i;
				invisibleInput?.focus();
			}}
		>
			<p>{i < input.length ? input[i] : ''}</p>
		</div>
	{/each}
</div>

<div class="buttons">
	<button>Check</button>
	<button>Hints</button>
</div>

<!-- svelte-ignore a11y_autofocus -->
<input autofocus style="width: 0px; height: 0px; opacity: 0;" bind:this={invisibleInput} />

<style>
	.author {
		background: #ffefcd;
		padding: 0.5rem;
		border-radius: 20px 20px 0 0;
		border: 5px solid black;
		width: fit-content;
		border-bottom: none;
		font-size: 0.75rem;
		margin-top: 1rem;
	}

	.clue {
		background: white;
		padding: 1rem;
		border-radius: 0 20px 20px 20px;
		border: 5px solid black;
		font-size: 2rem;
	}

	.input {
		margin-top: 2rem;
		display: flex;
		justify-content: center;
	}

	.input p {
		font-family: 'Jua', sans-serif;
		font-size: 2.5rem;
		transform: translateY(3px);
	}

	.letter {
		background: white;
		border: 3px solid black;
		border-left: none;
		width: 50px;
		height: 50px;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.letter.selected {
		background: #d7d7d7;
	}

	.letter:first-child {
		border-left: 3px solid black;
		border-radius: 10px 0 0 10px;
	}

	.letter:last-child {
		border-radius: 0 10px 10px 0;
	}

	.buttons {
		margin-top: 2rem;
		display: flex;
		justify-content: center;
		gap: 1rem;
	}

	.buttons button {
		background: #ffefcd;
		border: 3px solid black;
		border-radius: 10px;
		padding: 0.5rem 1rem;
		font-size: 1.5rem;
		cursor: pointer;
	}

	.buttons button:hover {
		background: white;
	}
</style>
