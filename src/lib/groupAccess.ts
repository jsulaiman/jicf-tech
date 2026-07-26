import { cookies } from "next/headers";
import { GROUP_ACCESS_COOKIE_NAME, isValidGroupAccessToken } from "./auth";
import type { Group } from "./types";

export async function hasGroupAccess(group: Group): Promise<boolean> {
  if (!group.passcode) return false;
  const cookieStore = await cookies();
  const raw = cookieStore.get(GROUP_ACCESS_COOKIE_NAME)?.value;
  if (!raw) return false;
  let map: Record<string, string>;
  try {
    map = JSON.parse(raw);
  } catch {
    return false;
  }
  return isValidGroupAccessToken(group.id, group.passcode, map[group.id]);
}
