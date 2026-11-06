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
		},
		include: {
			hints: true
		}
	});

	if (!clue) {
		clue = await db.crypticClue.findFirst({ include: { hints: true } });
	}

	if (!clue) {
		throw new Error('No clue found');
	}

	return { clue };
};
