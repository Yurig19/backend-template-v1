// test/utils/knex.ts
import knex from 'knex';
import config from '../knex/knexfile';

export const db = knex(config);
