import { db } from '#lib/server/db.ts';
import type { PageLoad } from './$types';

export const load = (async () => {
	let clue = await db.crypticClue.findUnique({
		where: {
			date: new Date(new Date().toISOString().split('T')[0])
		}
	});

	if (!clue) {
		clue = await db.crypticClue.findFirst({
			include: {
				hints: {}
			}
		});
	}

	if (!clue) {
		throw new Error('No clue found');
	}

	const hints = await db.hint.findMany({
		where: {
			clueId: clue.id
		}
	});

	return { ...clue, hints };
}) satisfies PageLoad;
