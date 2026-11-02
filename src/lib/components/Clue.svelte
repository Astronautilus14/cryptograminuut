<script lang="ts">
	import { browser } from '$app/env';
	import Modal from '#lib/components/Modal.svelte';
	import VirtualKeyboard from '#lib/components/VirtualKeyboard.svelte';
	import confetti from '@hiseb/confetti';
	import type { CrypticClue, Hint } from '../../../zenstack/models';

	let { clue, hints, isDaily }: { clue: CrypticClue; hints: Hint[]; isDaily: boolean } = $props();

	let selected = $state(0);
	let input = $state<string[]>([]);

	let showHints = $state(false);

	let localStorageID = $derived(isDaily ? new Date().toISOString().split('T')[0] : clue.id);

	let hintsUsed = $derived<string[]>(
		browser ? (localStorage.getItem(`hintsUsed-${localStorageID}`)?.split(',') ?? []) : []
	);

	let letterHintsUsed = $derived<number[]>(
		browser
			? (localStorage.getItem(`letterHintsUsed-${localStorageID}`)?.split(',').map(Number) ?? [])
			: []
	);

	let incorrect = $state(false);
	let completed = $state(false);

	$effect(() => {
		const nextLength = clue?.answer?.length ?? 0;

		if (input.length !== nextLength) {
			input = Array.from({ length: nextLength }, (_, i) => input[i] ?? ' ');
		}
	});

	function handleKeydown(event: KeyboardEvent) {
		if (completed) return;
		if (selected >= clue.answer.length) return;

		if (event.key === 'Backspace') {
			input[selected] = ' ';
			selected = Math.max(selected - 1, 0);
		} else if (event.key === 'ArrowLeft') {
			selected = Math.max(selected - 1, 0);
		} else if (event.key === 'ArrowRight' || event.key === ' ') {
			selected = Math.min(selected + 1, clue.answer.length - 1);
		} else if (event.key === 'Enter') {
			onCheck();
		}

		// Check if key is a letter
		if (!/^[a-zA-Z]$/.test(event.key)) return;

		input[selected] = event.key.toUpperCase();
		selected = Math.min(selected + 1, clue.answer.length - 1);
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
		const correctAnswer = clue.answer.toUpperCase();

		if (userInput === correctAnswer) {
			completed = true;
			selected = -1;
			confetti();
		} else {
			incorrect = true;
		}
	}

	let answerLength = $derived(
		clue.answer
			.split(' ')
			.map((s: string) => s.length)
			.join(',')
	);

	let totalHintsUsed = $derived(hintsUsed.length + letterHintsUsed.length);

	let whatsappUri = $derived(
		`https://wa.me/?text=${encodeURIComponent(`Ik heb de cryptograminuut opgelost met ${totalHintsUsed} hint${totalHintsUsed == 1 ? '' : 's'}!\n🧩🧩🧩\n${clue.clue} (${answerLength})\n🧩🧩🧩\nProbeer het zelf🤔:\nhttps://cryptograminuut.nautdevroome.nl/`)}`
	);

	function onLetterHint() {
		const order = clue.letterHintOrder.split(',').map(Number);
		if (letterHintsUsed.length >= order.length) return;
		const nextLetterIdx = order[letterHintsUsed.length];

		if (nextLetterIdx === -1) return;

		input[nextLetterIdx] = clue.answer[nextLetterIdx];
		letterHintsUsed = [...letterHintsUsed, nextLetterIdx];
		localStorage.setItem(`letterHintsUsed-${localStorageID}`, letterHintsUsed.join(','));

		showHints = false;
	}

	function onHint(id: string) {
		if (hintsUsed.includes(id)) return;
		const hint = hints.find((h) => h.id === id);
		if (!hint) return;

		hintsUsed = [...hintsUsed, id];
		localStorage.setItem(`hintsUsed-${localStorageID}`, hintsUsed.join(','));
	}

	function getHighlight(idx: number) {
		for (const hint of hints) {
			if (!hintsUsed.includes(hint.id)) continue;
			for (const part of hint.part.split(';')) {
				const [start, end] = part.split(',').map(Number);
				if (idx >= start && idx <= end) {
					return hint.type;
				}
			}
		}
		return null;
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="author">
	<p>Auteur: {clue.author}</p>
</div>

<div class="clue">
	<p>
		{#each clue.clue as letter, i (i)}
			{@const highlight = getHighlight(i)}
			{#if highlight}
				<mark class={highlight.toLowerCase()}>{letter}</mark>
			{:else}
				{letter}
			{/if}
		{/each}
		({answerLength})
	</p>
</div>

<div class={`input ${incorrect ? 'incorrect' : ''}`}>
	<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
	{#each clue.answer as _, i (i)}
		{@const hasHint = letterHintsUsed.includes(i)}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class={`letter ${selected === i && !hasHint ? 'selected' : ''} ${hasHint ? 'hint' : ''}`}
			onclick={() => (selected = i)}
		>
			{#if hasHint}
				<p>{clue.answer[i].toUpperCase()}</p>
			{:else}
				<p>{i < input.length ? input[i] : ''}</p>
			{/if}
		</div>
	{/each}
</div>

{#if completed}
	<div class="completed">
		<p>Hints gebruikt: {totalHintsUsed}</p>
		{#each hints as hint (hint.id)}
			<div>
				<h3>{hint.name}</h3>
				<p>{hint.text}</p>
			</div>
		{/each}
		{#if isDaily}
			<button onclick={() => window.open(whatsappUri, '_blank')}>Delen</button>
		{/if}
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
		{#if hintsUsed.length === 0}
			<h2>Hints</h2>
		{/if}

		{#each hintsUsed as id (id)}
			{@const hint = hints.find((h) => h.id === id)}
			{#if hint}
				<div class="hint">
					<h3>{hint.name}</h3>
					<p>{hint.text}</p>
				</div>
			{/if}
		{/each}

		{#each hints as hint (hint.id)}
			{#if !hintsUsed.includes(hint.id)}
				<button onclick={() => onHint(hint.id)}>
					{hint.name}
				</button>
			{/if}
		{/each}

		<button
			onclick={onLetterHint}
			disabled={letterHintsUsed.length >= clue.letterHintOrder.split(',').length}
		>
			Letter
		</button>
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

	.letter.hint {
		background: #60ff8a;
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

	button:disabled {
		outline: none !important;
		cursor: not-allowed;
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

	.hints button {
		max-width: 200px;
	}

	mark.definition,
	mark.other {
		background: #5ef5f5;
	}

	mark.indicator {
		background: #ff98e2;
	}

	mark.fodder {
		background: #60ff8a;
	}
</style>
