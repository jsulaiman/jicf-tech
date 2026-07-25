import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const ADMIN_COOKIE = "jicf_admin_session";
const SECRET_FILE = path.join(process.cwd(), "data", "session-secret");

let cachedSecret: string | null = null;

async function getSecret(): Promise<string> {
  if (cachedSecret) return cachedSecret;
  try {
    cachedSecret = (await fs.readFile(SECRET_FILE, "utf-8")).trim();
    if (cachedSecret) return cachedSecret;
  } catch {
    // fall through to generate one
  }
  const secret = randomBytes(32).toString("hex");
  await fs.mkdir(path.dirname(SECRET_FILE), { recursive: true });
  await fs.writeFile(SECRET_FILE, secret);
  cachedSecret = secret;
  return secret;
}

async function signToken(): Promise<string> {
  const secret = await getSecret();
  return createHmac("sha256", secret).update("admin-session").digest("hex");
}

export function isAdminPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export async function checkAdminPassword(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function createAdminSessionValue(): Promise<{
  name: string;
  value: string;
}> {
  return { name: ADMIN_COOKIE, value: await signToken() };
}

export async function isValidAdminSessionValue(
  value: string | undefined
): Promise<boolean> {
  if (!value) return false;
  const expected = await signToken();
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const ADMIN_COOKIE_NAME = ADMIN_COOKIE;
