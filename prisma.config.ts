import path from 'path';
import dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

dotenv.config();

export default defineConfig({
  schema: path.join('prisma'),
  migrations: {
    path: 'prisma/migrations',
  },
  engine: 'classic',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
