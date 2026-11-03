<script lang="ts">
	import type { PageProps } from './$types';
	import { superForm } from 'sveltekit-superforms';
	import { untrack } from 'svelte';
	import SuperDebug from 'sveltekit-superforms/SuperDebug.svelte';
	import { HintType } from '../../../zenstack/models';

	let { data }: PageProps = $props();

	// Form
	const superform = superForm(
		untrack(() => data.form),
		{
			dataType: 'json'
		}
	);

	const { form, errors, message, enhance } = superform;

	// Letter hint
	let letterHintOrderInput = $state('');

	$effect(() => {
		$form.letterHintOrder = letterHintOrderInput
			.split(',')
			.map((x) => Number.parseInt(x.replaceAll(' ', '')))
			.filter((x) => !isNaN(x));
	});

	// Highlight
	let highlightInputs = $state<string[]>([]);

	let highlightParts = $derived(
		(() => {
			const inputs = highlightInputs;

			const ranges = [];

			for (let i = 0; i < inputs.length; i++) {
				ranges.push(
					inputs[i].split(';').map((x) => {
						return x
							.split(',')
							.map((x) => Number.parseInt(x.replaceAll(' ', '')))
							.filter((x) => !isNaN(x));
					})
				);
			}

			return ranges;
		})()
	);

	$effect(() => {
		const parts = highlightParts;

		untrack(() => {
			if (!$form.hints) return;
			for (let i = 0; i < parts.length && i < $form.hints.length; i++) {
				$form.hints[i].part = parts[i];
			}
		});
	});

	function getHighlight(idx: number) {
		for (const hint of $form.hints ?? []) {
			for (const [start, end] of hint.part ?? []) {
				if (start <= idx && idx <= end) {
					return hint.type;
				}
			}
		}
		return null;
	}

	// UI
	let stage2 = $state(false);

	function onNext() {
		letterHintOrderInput = $form.answer
			.split('')
			.map((_, i) => i)
			.join(',');

		$form.hints = [];

		stage2 = true;
	}

	function addHint() {
		highlightInputs = [...highlightInputs, ''];

		$form.hints = [
			...($form.hints ?? []),
			{
				type: HintType.definition,
				name: '',
				text: '',
				part: []
			}
		];
	}
</script>

<!-- 
<SuperDebug data={$form} />
<pre>{highlightInputs}</pre>
<pre>{JSON.stringify(highlightParts, null, 2)}</pre> -->

<form method="POST" use:enhance>
	{#if stage2}
		<h3>Hints</h3>

		<div class="input">
			<label for="letterHintOrder">Letter hint volgorde</label>
			<div class="letters">
				{#each $form.answer.split('') as letter, i (i)}
					<div class="letter">
						<p>{letter.toUpperCase()}</p>
						<span class="idx">{i}</span>
						<!-- {#if $form.letterHintOrder && $form.letterHintOrder.includes(i)}
							<span class="number">{$form.letterHintOrder.findIndex((x) => x == i) ?? '?'}</span>
						{/if} -->
					</div>
				{/each}
			</div>
			<input type="text" name="letterHintOrder" bind:value={letterHintOrderInput} />
		</div>

		<h2>
			{#each $form.clue as letter, i (i)}
				{@const highlight = getHighlight(i)}
				{#if highlight}
					<mark class={highlight.toLowerCase()}>{letter}</mark>
				{:else}
					{letter}
				{/if}
			{/each}
		</h2>

		<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
		{#each $form.hints as _, i (i)}
			{@const labelPrefix = `hint ${i}`}
			<h3>Hint #{i + 1}</h3>

			<label for={`${labelPrefix} name`}>Titel</label>
			<input type="text" name={`${labelPrefix} name`} bind:value={$form.hints![i].name} />

			<label for={`${labelPrefix} text`}>Tekst</label>
			<input type="text" name={`${labelPrefix} text`} bind:value={$form.hints![i].text} />

			<label for={`${labelPrefix} type`}>Type</label>
			<select name={`${labelPrefix} type`} bind:value={$form.hints![i].type}>
				{#each Object.keys(HintType) as type (type)}
					<option value={type}>{type}</option>
				{/each}
			</select>

			<label for={`${labelPrefix} part`}>Puzzeldeel</label>
			<input type="text" name={`${labelPrefix} part`} bind:value={highlightInputs[i]} />
		{/each}

		<button type="button" onclick={addHint}>Hint toevoegen</button>
		<button type="submit">Opslaan</button>
	{:else}
		<h3>Puzzel maken</h3>

		<div class="input">
			<label for="author">Auteur</label>
			<input type="text" name="author" bind:value={$form.author} />
			{#if $errors.author}<span class="invalid">{$errors.author}</span>{/if}
		</div>

		<div class="input">
			<label for="clue">Puzzel</label>
			<input type="text" name="clue" bind:value={$form.clue} />
			{#if $errors.clue}<span class="invalid">{$errors.clue}</span>{/if}
		</div>

		<div class="input">
			<label for="answer">Antwoord</label>
			<input type="text" name="answer" bind:value={$form.answer} />
			{#if $errors.answer}<span class="invalid">{$errors.answer}</span>{/if}
		</div>

		<button onclick={onNext} type="button">Volgende</button>
	{/if}
</form>

{#if $message}<h3>{$message}</h3>{/if}

<style>
	.letters {
		display: flex;
		margin-top: 8px;
	}

	.letter:first-child {
		border-left: 3px solid black;
	}

	.letter {
		background: white;
		border: 3px solid black;
		border-left: none;

		width: 40px;
		height: 40px;

		display: flex;
		justify-content: center;
		align-items: center;

		position: relative;
	}

	.letter .idx {
		position: absolute;
		top: -2px;
		left: 2px;
		font-family: 'Jua', sans-serif;
		font-size: 0.75rem;
	}

	/* .letter .number {
		font-family: 'Jua', sans-serif;
		position: absolute;
		margin-top: 125%;
		border-radius: 50%;
		background: white;
		width: 25px;
		height: 25px;
		text-align: center;
		border: 3px solid black;
	} */

	.letter p {
		font-family: 'Jua', sans-serif;
		font-size: 1.5rem;
	}

	form {
		border-radius: 5px;
		background-color: #f2f2f2;
		padding: 0.1px 20px 20px 20px;
	}

	form h3,
	form h2 {
		margin-top: 20px;
	}

	.input:first-child label {
		margin-top: 0;
	}

	label {
		display: block;
		margin-top: 8px;
	}

	input[type='text'],
	select {
		width: 100%;
		padding: 12px;
		margin-top: 8px;
		display: inline-block;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-sizing: border-box;
	}

	form button {
		width: 100%;
		background-color: #4caf50;
		color: white;
		padding: 14px;
		margin: 16px 0 0 0;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	form button:hover {
		background-color: #45a049;
	}

	.invalid {
		color: red;
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
