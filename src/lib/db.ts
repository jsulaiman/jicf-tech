import { promises as fs } from "fs";
import path from "path";
import type { Database } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

const EMPTY_DB: Database = {
  groups: [],
  members: [],
  cycles: [],
  commitments: [],
  assignments: [],
};

// Serializes reads/writes so concurrent requests in the same Node process
// can't interleave and clobber each other's changes to the JSON file.
let queue: Promise<unknown> = Promise.resolve();
function serialize<T>(fn: () => Promise<T>): Promise<T> {
  const result = queue.then(fn, fn);
  queue = result.catch(() => undefined);
  return result;
}

async function readRaw(): Promise<Database> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<Database>;
    return { ...EMPTY_DB, ...parsed };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(EMPTY_DB, null, 2));
      return { ...EMPTY_DB };
    }
    throw err;
  }
}

async function writeRaw(db: Database): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmpFile = `${DATA_FILE}.tmp`;
  await fs.writeFile(tmpFile, JSON.stringify(db, null, 2));
  await fs.rename(tmpFile, DATA_FILE);
}

export function readDB(): Promise<Database> {
  return serialize(readRaw);
}

/**
 * Reads the DB, lets `mutator` update it in place, then persists the result.
 * All mutations must go through this so writes stay serialized.
 */
export function mutateDB<T>(
  mutator: (db: Database) => T | Promise<T>
): Promise<T> {
  return serialize(async () => {
    const db = await readRaw();
    const result = await mutator(db);
    await writeRaw(db);
    return result;
  });
}

export function newId(): string {
  return crypto.randomUUID();
}
