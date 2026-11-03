import { message, superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { HintType } from '../../../zenstack/models';
import { fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

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

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(schema));

	// Always return { form } in load functions
	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(schema));

		console.log(form);

		if (!form.valid) {
			return fail(400, { form });
		}

		return message(form, 'Success');
	}
};
