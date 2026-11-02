import { db } from '#lib/server/db.ts';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const clue = await db.crypticClue.findUnique({
		where: {
			id: params.id
		}
	});

	if (!clue) {
		error(404, 'Clue not found');
	}

	const hints = await db.hint.findMany({
		where: {
			clueId: clue.id
		}
	});

	return { clue, hints };
};
