/**
 * Randomly pairs each commitment card with an accountability partner from the
 * same group. A partner is never assigned their own card, and partners are
 * distributed as evenly as possible when there are more cards than members
 * (or vice versa).
 */

function shuffle<T>(items: T[]): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Builds a length-`n` pool of member ids, repeating members as evenly as possible. */
function buildBalancedPool(memberIds: string[], n: number): string[] {
  const repeats = Math.ceil(n / memberIds.length);
  let pool: string[] = [];
  for (let i = 0; i < repeats; i++) {
    pool = pool.concat(shuffle(memberIds));
  }
  return shuffle(pool).slice(0, n);
}

function isValidDerangement(pool: string[], ownerIds: string[]): boolean {
  return pool.every((memberId, i) => memberId !== ownerIds[i]);
}

/**
 * Resolves any remaining self-assignment collisions in `pool` by swapping
 * with another slot. Guarantees no collisions remain unless a swap partner
 * genuinely doesn't exist (e.g. only one distinct member overall), in which
 * case that slot is left self-assigned and flagged by the caller.
 */
function fixCollisions(pool: string[], ownerIds: string[]): string[] {
  const fixed = pool.slice();
  for (let i = 0; i < fixed.length; i++) {
    if (fixed[i] !== ownerIds[i]) continue;
    let swapped = false;
    for (let j = 0; j < fixed.length; j++) {
      if (j === i) continue;
      const wouldFixI = fixed[j] !== ownerIds[i];
      const wouldNotBreakJ = fixed[i] !== ownerIds[j];
      if (wouldFixI && wouldNotBreakJ) {
        [fixed[i], fixed[j]] = [fixed[j], fixed[i]];
        swapped = true;
        break;
      }
    }
    if (!swapped) {
      // Fall back to any swap that at least fixes slot i, even if it
      // creates (or leaves) a collision elsewhere to be handled later.
      for (let j = 0; j < fixed.length; j++) {
        if (j === i) continue;
        if (fixed[j] !== ownerIds[i]) {
          [fixed[i], fixed[j]] = [fixed[j], fixed[i]];
          break;
        }
      }
    }
  }
  return fixed;
}

export interface AssignmentPairing {
  commitmentId: string;
  partnerMemberId: string;
  selfAssigned: boolean;
}

export function buildAssignmentPairings(
  commitments: { id: string; memberId: string }[],
  members: { id: string }[]
): AssignmentPairing[] {
  if (commitments.length === 0) return [];

  const ownerIds = commitments.map((c) => c.memberId);
  const memberIds = members.map((m) => m.id);
  const n = commitments.length;

  let pool: string[] = [];
  const MAX_ATTEMPTS = 200;
  let found = false;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    pool = buildBalancedPool(memberIds, n);
    if (isValidDerangement(pool, ownerIds)) {
      found = true;
      break;
    }
  }
  if (!found) {
    pool = fixCollisions(pool, ownerIds);
  }

  return commitments.map((commitment, i) => ({
    commitmentId: commitment.id,
    partnerMemberId: pool[i],
    selfAssigned: pool[i] === commitment.memberId,
  }));
}
