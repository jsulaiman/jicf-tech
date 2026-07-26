import { randomBytes } from "crypto";

// Excludes visually-ambiguous characters (0/O, 1/I/L) since this gets typed
// off a phone screen.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generatePasscode(length = 6): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export function normalizePasscode(value: string): string {
  return value.trim().toUpperCase();
}
