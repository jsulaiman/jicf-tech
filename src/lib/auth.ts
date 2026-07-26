import { createHash, createHmac, timingSafeEqual } from "crypto";

const ADMIN_COOKIE = "jicf_admin_session";

// Derived from ADMIN_PASSWORD rather than a generated + persisted secret, so
// session signing works identically across every serverless instance without
// needing shared disk.
function getSecret(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD must be set to sign admin sessions.");
  }
  return createHash("sha256").update(password).digest("hex");
}

function signToken(): string {
  return createHmac("sha256", getSecret()).update("admin-session").digest("hex");
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
  return { name: ADMIN_COOKIE, value: signToken() };
}

export async function isValidAdminSessionValue(
  value: string | undefined
): Promise<boolean> {
  if (!value) return false;
  const expected = signToken();
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const ADMIN_COOKIE_NAME = ADMIN_COOKIE;

// ---------- Group passcode access ----------
//
// Signed proof that a browser entered a given group's current passcode.
// Binding the token to the passcode value itself (rather than just the
// group id) means rotating a group's passcode automatically invalidates
// every previously issued token for it — no separate revocation bookkeeping
// needed.

export const GROUP_ACCESS_COOKIE_NAME = "jicf_group_access";

function groupAccessToken(groupId: string, passcode: string): string {
  return createHmac("sha256", getSecret())
    .update(`group-access:${groupId}:${passcode}`)
    .digest("hex");
}

export function createGroupAccessToken(groupId: string, passcode: string): string {
  return groupAccessToken(groupId, passcode);
}

export function isValidGroupAccessToken(
  groupId: string,
  passcode: string,
  token: string | undefined
): boolean {
  if (!token || !passcode) return false;
  const expected = groupAccessToken(groupId, passcode);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function passcodesMatch(stored: string, entered: string): boolean {
  if (!stored) return false;
  const a = Buffer.from(stored);
  const b = Buffer.from(entered);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
