<script lang="ts">
	import Modal from '#lib/components/Modal.svelte';
	import VirtualKeyboard from '#lib/components/VirtualKeyboard.svelte';
	import type { PageProps } from './$types';
	import confetti from '@hiseb/confetti';

	let { data }: PageProps = $props();

	let selected = $state(0);
	let input = $state<string[]>([]);

	let showHints = $state(false);
	let hintsUsed = $state<string[]>([]);

	let incorrect = $state(false);
	let completed = $state(false);

	$effect(() => {
		const nextLength = data?.answer?.length ?? 0;

		if (input.length !== nextLength) {
			input = Array.from({ length: nextLength }, (_, i) => input[i] ?? ' ');
		}
	});

	function handleKeydown(event: KeyboardEvent) {
		if (completed) return;
		if (selected >= data.answer.length) return;

		if (event.key === 'Backspace') {
			input[selected] = ' ';
			selected = Math.max(selected - 1, 0);
		} else if (event.key === 'ArrowLeft') {
			selected = Math.max(selected - 1, 0);
		} else if (event.key === 'ArrowRight' || event.key === ' ') {
			selected = Math.min(selected + 1, data.answer.length - 1);
		} else if (event.key === 'Enter') {
			onCheck();
		}

		// Check if key is a letter
		if (!/^[a-zA-Z]$/.test(event.key)) return;

		input[selected] = event.key.toUpperCase();
		selected = Math.min(selected + 1, data.answer.length - 1);
	}

	$effect(() => {
		if (incorrect) {
			const timeout = setTimeout(() => {
				incorrect = false;
			}, 400);

			return () => clearTimeout(timeout);
		}
	});

	function onCheck() {
		const userInput = input.join('').toUpperCase();
		const correctAnswer = data.answer.toUpperCase();

		if (userInput === correctAnswer) {
			completed = true;
			selected = -1;
			confetti();
		} else {
			incorrect = true;
		}
	}

	let answerLength = $derived(
		data.answer
			.split(' ')
			.map((s: string) => s.length)
			.join(',')
	);

	let whatsappUri = $derived(
		`https://wa.me/?text=${encodeURIComponent(`Ik heb de cryptograminuut opgelost met ${hintsUsed.length} hints!\n${data.clue} (${answerLength}).\nProbeer het zelf: https://cryptograminuut.nautdevroome.nl/`)}`
	);
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="author">
	<p>Auteur: {data.author}</p>
</div>

<div class="clue">
	<p>{data.clue} ({answerLength})</p>
</div>

<div class={`input ${incorrect ? 'incorrect' : ''}`}>
	<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
	{#each data.answer as _, i (i)}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class={`letter ${selected === i ? 'selected' : ''}`} onclick={() => (selected = i)}>
			<p>{i < input.length ? input[i] : ''}</p>
		</div>
	{/each}
</div>

{#if completed}
	<div class="completed">
		<p>Hints gebruikt: {hintsUsed.length}</p>
		{#each data.hints as hint (hint.id)}
			<div>
				<h3>{hint.name}</h3>
				<p>{hint.text}</p>
			</div>
		{/each}
		<button onclick={() => window.open(whatsappUri, '_blank')}>Delen</button>
	</div>
{:else}
	<div class="buttons">
		<button onclick={onCheck}>Check</button>
		<button onclick={() => (showHints = true)}>Hints</button>
	</div>
{/if}

{#if !completed}
	<VirtualKeyboard />
{/if}

<Modal bind:showModal={showHints}>
	<div class="hints">
		{#each data.hints as hint (hint.id)}
			<div class="hint">
				{#if !hintsUsed.includes(hint.id)}
					<button
						onclick={() => {
							hintsUsed = [...hintsUsed, hint.id];
						}}
					>
						{hint.name}
					</button>
				{:else}
					<h3>{hint.name}</h3>
					<p>{hint.text}</p>
				{/if}
			</div>
		{/each}
	</div>
</Modal>

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

	.input.incorrect {
		animation: shake 0.4s;
	}

	@keyframes shake {
		0% {
			transform: translateX(0);
		}
		25% {
			transform: translateX(-5px);
		}
		50% {
			transform: translateX(5px);
		}
		75% {
			transform: translateX(-5px);
		}
		100% {
			transform: translateX(0);
		}
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

	button {
		background: #ffefcd;
		border: 3px solid black;
		border-radius: 10px;
		padding: 0.5rem 1rem;
		font-size: 1.5rem;
		cursor: pointer;
	}

	button:hover {
		outline: 3px solid #f5c55e;
	}

	.completed {
		background: #ffefcd;
		border: 3px solid black;
		border-radius: 20px;
		padding: 1rem;
		margin-top: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.completed button {
		background: white;
		width: fit-content;
	}

	.hints {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
