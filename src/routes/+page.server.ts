import { db } from '#lib/server/db.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	let clue = await db.crypticClue.findUnique({
		where: {
			date: new Date(
				new Date().toLocaleDateString('sv-SE', {
					timeZone: 'Europe/Amsterdam'
				})
			)
		}
	});

	if (!clue) {
		clue = await db.crypticClue.findFirst();
	}

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
