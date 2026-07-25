import { Pool } from "pg";
import type { Database } from "./types";

const EMPTY_DB: Database = {
  groups: [],
  members: [],
  cycles: [],
  commitments: [],
  assignments: [],
};

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "POSTGRES_URL (or DATABASE_URL) must be set — this app stores its data in Postgres."
  );
}

const pool = new Pool({ connectionString });

// Lazily creates the single-row state table on first use; idempotent so it's
// safe to run from every cold start.
let initialized: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!initialized) {
    initialized = pool
      .query(
        `CREATE TABLE IF NOT EXISTS app_state (
           id SMALLINT PRIMARY KEY,
           data JSONB NOT NULL,
           updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
         )`
      )
      .then(() =>
        pool.query(
          `INSERT INTO app_state (id, data) VALUES (1, $1)
           ON CONFLICT (id) DO NOTHING`,
          [JSON.stringify(EMPTY_DB)]
        )
      )
      .then(() => undefined);
  }
  return initialized;
}

// Backfills fields added after some rows were already written (e.g. groups
// created before Group.passcode existed) so older stored data still matches
// the current Database shape.
function normalize(db: Database): Database {
  return {
    ...db,
    groups: db.groups.map((g) => ({ ...g, passcode: g.passcode ?? "" })),
  };
}

export async function readDB(): Promise<Database> {
  await ensureTable();
  const { rows } = await pool.query("SELECT data FROM app_state WHERE id = 1");
  return normalize({ ...EMPTY_DB, ...(rows[0]?.data ?? {}) });
}

/**
 * Reads the DB, lets `mutator` update it in place, then persists the result.
 * Runs inside a transaction with a row lock so concurrent mutations across
 * serverless invocations can't interleave and clobber each other's writes.
 */
export async function mutateDB<T>(
  mutator: (db: Database) => T | Promise<T>
): Promise<T> {
  await ensureTable();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      "SELECT data FROM app_state WHERE id = 1 FOR UPDATE"
    );
    const db: Database = normalize({ ...EMPTY_DB, ...(rows[0]?.data ?? {}) });
    const result = await mutator(db);
    await client.query(
      "UPDATE app_state SET data = $1, updated_at = now() WHERE id = 1",
      [JSON.stringify(db)]
    );
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export function newId(): string {
  return crypto.randomUUID();
}
