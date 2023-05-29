import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";
import { DB } from "kysely-codegen";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// You'd create one of these when you start your app.
export const db = new Kysely<DB>({
  // Use MysqlDialect for MySQL and SqliteDialect for SQLite.
  dialect: new PostgresDialect({ pool }),
});
