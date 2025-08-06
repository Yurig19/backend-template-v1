import { execSync } from 'node:child_process';
import { existsSync, unlinkSync } from 'node:fs';

const TEST_DB_PATH = './prisma/test.db';

if (existsSync(TEST_DB_PATH)) {
  unlinkSync(TEST_DB_PATH);
}

console.log('🧪 Setting up: creating test.db with migrations');

execSync('pnpm prisma generate');
execSync('pnpm prisma migrate deploy', {
  env: { ...process.env, DATABASE_URL: 'file:./prisma/test.db' },
});
