import { db } from '#lib/server/db.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const clue = await db.crypticClue.findUnique({
		where: {
			id: params.id
		}
	});

	if (!clue) {
		throw new Error('No clue found');
	}

	const hints = await db.hint.findMany({
		where: {
			clueId: clue.id
		}
	});

	return { clue, hints };
};
