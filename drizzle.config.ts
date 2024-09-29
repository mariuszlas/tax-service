import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';
import path from 'path';

dotenv.config({ path: path.resolve('envs', `${process.env.APP_ENV}.env`) });

export default {
    schema: './src/db/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: { url: process.env.DATABASE_URL },
} as Config;
