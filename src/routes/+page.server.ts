import { db } from '#lib/server/db.ts';
import type { PageLoad } from './$types';

export const load = (async () => {
	return db.clue.findUnique({
		where: {
			date: new Date(new Date().toISOString().split('T')[0])
		}
	});
}) satisfies PageLoad;
