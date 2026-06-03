import type { Knex } from 'knex';
import { config } from './src/config';

const knexConfig: Knex.Config = {
  client: 'better-sqlite3',
  connection: {
    filename: config.database.url,
  },
  useNullAsDefault: true,
  migrations: {
    directory: './src/db/migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './src/db/seeds',
    extension: 'ts',
  },
  pool: {
    afterCreate: (conn: any, cb: Function) => {
      conn.pragma('journal_mode = WAL');
      conn.pragma('foreign_keys = ON');
      cb();
    },
  },
};

export default knexConfig;