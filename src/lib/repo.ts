import { readDB } from "./db";
import type { Group, Member, Cycle, Commitment, Assignment } from "./types";

export async function getGroups(): Promise<Group[]> {
  const db = await readDB();
  return [...db.groups].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getGroup(groupId: string): Promise<Group | undefined> {
  const db = await readDB();
  return db.groups.find((g) => g.id === groupId);
}

export async function getMembers(groupId?: string): Promise<Member[]> {
  const db = await readDB();
  const members = groupId
    ? db.members.filter((m) => m.groupId === groupId)
    : db.members;
  return [...members].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getMember(memberId: string): Promise<Member | undefined> {
  const db = await readDB();
  return db.members.find((m) => m.id === memberId);
}

export async function getCycles(): Promise<Cycle[]> {
  const db = await readDB();
  return [...db.cycles].sort((a, b) => b.weekStart.localeCompare(a.weekStart));
}

export async function getOpenCycle(): Promise<Cycle | undefined> {
  const db = await readDB();
  return db.cycles.find((c) => c.status === "open");
}

export async function getCycle(cycleId: string): Promise<Cycle | undefined> {
  const db = await readDB();
  return db.cycles.find((c) => c.id === cycleId);
}

export async function getCommitments(cycleId: string): Promise<Commitment[]> {
  const db = await readDB();
  return db.commitments.filter((c) => c.cycleId === cycleId);
}

export async function getAssignments(cycleId: string): Promise<Assignment[]> {
  const db = await readDB();
  return db.assignments.filter((a) => a.cycleId === cycleId);
}

export async function getAssignmentsForPartner(
  memberId: string
): Promise<Assignment[]> {
  const db = await readDB();
  return db.assignments.filter((a) => a.partnerMemberId === memberId);
}

export async function getFullState() {
  return readDB();
}
