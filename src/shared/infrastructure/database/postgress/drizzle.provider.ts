import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import postgres from 'postgres';
import * as schema from './schema/index.js';

export const DRIZZLE = Symbol('DRIZZLE');
export type DrizzleDB = NodePgDatabase<typeof schema>;

export const DrizzleProvider: Provider = {
  provide: DRIZZLE,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const url = configService.getOrThrow<string>('POSTGRESS_DB_URL');
    const client = postgres(url);
    const db = drizzle(client, { schema });
    await db.execute(sql`SELECT 1`);
    return db;
  },
};
