import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

dotenv.config();

export default {
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        // url: process.env.DATABASE_URL,
        url: 'postgres://postgres:postgres@localhost:5432/test_db',
    },
} as Config;
