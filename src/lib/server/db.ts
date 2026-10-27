import { schema } from '../../../zenstack/schema';
import { createPool } from 'mysql2';
import { ZenStackClient } from '@zenstackhq/orm';
import { MysqlDialect } from '@zenstackhq/orm/dialects/mysql';
import { DATABASE_URL } from '$app/env/private';

if (!DATABASE_URL) {
	throw new Error('DATABASE_URL environment variable is not set');
}

export const db = new ZenStackClient(schema, {
	dialect: new MysqlDialect({
		pool: createPool(DATABASE_URL)
	})
});
