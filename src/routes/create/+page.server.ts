import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { HintType } from '../../../zenstack/models';
import { error, fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { SECRET } from '$app/env/private';
import { db } from '#lib/server/db.ts';

// Define outside the load function so the adapter can be cached
const schema = z.object({
	date: z.date().optional(),
	author: z.string().nonempty(),
	clue: z.string().nonempty(),
	answer: z.string().nonempty(),
	letterHintOrder: z.array(z.number()).optional(),
	hints: z
		.array(
			z.object({
				type: z.enum(Object.keys(HintType)),
				name: z.string().nonempty(),
				text: z.string().nonempty(),
				part: z.array(z.array(z.number()).length(2)).optional()
			})
		)
		.superRefine((hints, ctx) => {
			const names = new Set<string>();
			hints.forEach((hint, index) => {
				if (names.has(hint.name)) {
					ctx.addIssue({
						code: 'custom',
						message: 'Hint names must be unique',
						path: [index, 'name']
					});
				}
				names.add(hint.name);
			});
		})
		.optional()
});

export const load: PageServerLoad = async ({ cookies }) => {
	// Auth
	const token = cookies.get('token');
	if (!token || token !== SECRET) {
		return error(403);
	}

	const form = await superValidate(zod4(schema));

	// Always return { form } in load functions
	return { form };
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const token = cookies.get('token');
		if (!token || token !== SECRET) {
			return error(403);
		}

		const form = await superValidate(request, zod4(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { id } = await db.crypticClue.create({
			data: {
				author: form.data.author,
				clue: form.data.clue,
				answer: form.data.answer,
				letterHintOrder: form.data.letterHintOrder?.join(',') ?? '' // TODO set default
			}
		});

		for (const hint of form.data.hints ?? []) {
			await db.hint.create({
				data: {
					clueId: id,
					type: hint.type as HintType,
					text: hint.text,
					part: hint.part?.map((x) => x.join(',')).join(';') ?? '',
					name: hint.name
				}
			});
		}

		return message(form, 'Success');
	}
};
