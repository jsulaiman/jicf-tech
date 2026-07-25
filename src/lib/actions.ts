"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { mutateDB, newId, readDB } from "./db";
import {
  ADMIN_COOKIE_NAME,
  GROUP_ACCESS_COOKIE_NAME,
  checkAdminPassword,
  createAdminSessionValue,
  createGroupAccessToken,
  passcodesMatch,
} from "./auth";
import { buildAssignmentPairings } from "./assign";
import { generatePasscode, normalizePasscode } from "./passcode";

function str(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// ---------- Admin auth ----------

export async function loginAdmin(formData: FormData): Promise<void> {
  const password = str(formData, "password");
  const nextPath = str(formData, "next") || "/admin";
  const ok = await checkAdminPassword(password);
  const cookieStore = await cookies();
  if (!ok) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(nextPath)}`);
  }
  const session = await createAdminSessionValue();
  cookieStore.set(session.name, session.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  redirect(nextPath.startsWith("/") ? nextPath : "/admin");
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}

// ---------- Group passcode access ----------

export async function unlockGroup(formData: FormData): Promise<void> {
  const groupId = str(formData, "groupId");
  const passcode = normalizePasscode(str(formData, "passcode"));
  const returnTo = str(formData, "returnTo") || "/";
  const safeReturnTo = returnTo.startsWith("/") ? returnTo : "/";
  const errorUrl = `${safeReturnTo}${safeReturnTo.includes("?") ? "&" : "?"}passcodeError=1`;

  const db = await readDB();
  const group = db.groups.find((g) => g.id === groupId);
  if (!group || !passcodesMatch(group.passcode, passcode)) {
    redirect(errorUrl);
  }

  const cookieStore = await cookies();
  const existingRaw = cookieStore.get(GROUP_ACCESS_COOKIE_NAME)?.value;
  let map: Record<string, string> = {};
  if (existingRaw) {
    try {
      map = JSON.parse(existingRaw);
    } catch {
      map = {};
    }
  }
  map[groupId] = createGroupAccessToken(groupId, group.passcode);

  cookieStore.set(GROUP_ACCESS_COOKIE_NAME, JSON.stringify(map), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 90,
    path: "/",
  });
  redirect(safeReturnTo);
}

// ---------- Groups ----------

export async function createGroup(formData: FormData): Promise<void> {
  const name = str(formData, "name");
  if (!name) return;
  await mutateDB((db) => {
    db.groups.push({
      id: newId(),
      name,
      passcode: generatePasscode(),
      createdAt: new Date().toISOString(),
    });
  });
  revalidatePath("/admin/groups");
}

export async function regenerateGroupPasscode(formData: FormData): Promise<void> {
  const groupId = str(formData, "groupId");
  if (!groupId) return;
  await mutateDB((db) => {
    const group = db.groups.find((g) => g.id === groupId);
    if (group) group.passcode = generatePasscode();
  });
  revalidatePath("/admin/groups");
  revalidatePath(`/admin/groups/${groupId}`);
}

export async function setGroupPasscode(formData: FormData): Promise<void> {
  const groupId = str(formData, "groupId");
  const passcode = normalizePasscode(str(formData, "passcode"));
  if (!groupId || !passcode) return;
  await mutateDB((db) => {
    const group = db.groups.find((g) => g.id === groupId);
    if (group) group.passcode = passcode;
  });
  revalidatePath("/admin/groups");
  revalidatePath(`/admin/groups/${groupId}`);
}

export async function renameGroup(formData: FormData): Promise<void> {
  const groupId = str(formData, "groupId");
  const name = str(formData, "name");
  if (!groupId || !name) return;
  await mutateDB((db) => {
    const group = db.groups.find((g) => g.id === groupId);
    if (group) group.name = name;
  });
  revalidatePath("/admin/groups");
  revalidatePath(`/admin/groups/${groupId}`);
}

export async function deleteGroup(formData: FormData): Promise<void> {
  const groupId = str(formData, "groupId");
  if (!groupId) return;
  await mutateDB((db) => {
    const hasMembers = db.members.some((m) => m.groupId === groupId);
    if (hasMembers) return;
    db.groups = db.groups.filter((g) => g.id !== groupId);
  });
  revalidatePath("/admin/groups");
}

// ---------- Members ----------

export async function addMember(formData: FormData): Promise<void> {
  const groupId = str(formData, "groupId");
  const name = str(formData, "name");
  const phone = str(formData, "phone");
  if (!groupId || !name || !phone) return;
  await mutateDB((db) => {
    db.members.push({
      id: newId(),
      groupId,
      name,
      phone,
      active: true,
      createdAt: new Date().toISOString(),
    });
  });
  revalidatePath(`/admin/groups/${groupId}`);
}

export async function updateMember(formData: FormData): Promise<void> {
  const memberId = str(formData, "memberId");
  const groupId = str(formData, "groupId");
  const name = str(formData, "name");
  const phone = str(formData, "phone");
  if (!memberId || !name || !phone) return;
  await mutateDB((db) => {
    const member = db.members.find((m) => m.id === memberId);
    if (member) {
      member.name = name;
      member.phone = phone;
    }
  });
  revalidatePath(`/admin/groups/${groupId}`);
}

export async function setMemberActive(formData: FormData): Promise<void> {
  const memberId = str(formData, "memberId");
  const groupId = str(formData, "groupId");
  const active = str(formData, "active") === "true";
  if (!memberId) return;
  await mutateDB((db) => {
    const member = db.members.find((m) => m.id === memberId);
    if (member) member.active = active;
  });
  revalidatePath(`/admin/groups/${groupId}`);
}

// ---------- Cycles ----------

export async function createCycle(formData: FormData): Promise<void> {
  const label = str(formData, "label");
  const weekStart = str(formData, "weekStart");
  if (!label || !weekStart) return;
  await mutateDB((db) => {
    for (const cycle of db.cycles) {
      if (cycle.status === "open") cycle.status = "closed";
    }
    db.cycles.push({
      id: newId(),
      label,
      weekStart,
      status: "open",
      createdAt: new Date().toISOString(),
    });
  });
  revalidatePath("/admin");
  revalidatePath("/submit");
  revalidatePath("/tracking");
}

export async function closeCycle(formData: FormData): Promise<void> {
  const cycleId = str(formData, "cycleId");
  if (!cycleId) return;
  await mutateDB((db) => {
    const cycle = db.cycles.find((c) => c.id === cycleId);
    if (cycle) cycle.status = "closed";
  });
  revalidatePath("/admin");
  revalidatePath("/submit");
  revalidatePath(`/admin/cycles/${cycleId}`);
}

export async function reopenCycle(formData: FormData): Promise<void> {
  const cycleId = str(formData, "cycleId");
  if (!cycleId) return;
  await mutateDB((db) => {
    for (const cycle of db.cycles) {
      if (cycle.status === "open") cycle.status = "closed";
    }
    const cycle = db.cycles.find((c) => c.id === cycleId);
    if (cycle) cycle.status = "open";
  });
  revalidatePath("/admin");
  revalidatePath("/submit");
  revalidatePath(`/admin/cycles/${cycleId}`);
}

// ---------- Commitments ----------

export async function submitCommitment(
  formData: FormData
): Promise<{ error?: string; ok?: boolean }> {
  const cycleId = str(formData, "cycleId");
  const groupId = str(formData, "groupId");
  const memberId = str(formData, "memberId");
  const obedienceText = str(formData, "obedienceText");
  const phone = str(formData, "phone");

  if (!cycleId || !groupId || !memberId || !obedienceText || !phone) {
    return { error: "Please fill in every field." };
  }

  await mutateDB((db) => {
    const cycle = db.cycles.find((c) => c.id === cycleId);
    if (!cycle || cycle.status !== "open") return;
    const member = db.members.find((m) => m.id === memberId && m.groupId === groupId);
    if (!member) return;

    const now = new Date().toISOString();
    const existing = db.commitments.find(
      (c) => c.cycleId === cycleId && c.memberId === memberId
    );
    if (existing) {
      existing.obedienceText = obedienceText;
      existing.phone = phone;
      existing.updatedAt = now;
    } else {
      db.commitments.push({
        id: newId(),
        cycleId,
        groupId,
        memberId,
        obedienceText,
        phone,
        submittedAt: now,
        updatedAt: now,
      });
    }
    // Keep the member's phone number in sync for future weeks.
    member.phone = phone;
  });

  revalidatePath("/tracking");
  revalidatePath(`/admin/cycles/${cycleId}`);
  return { ok: true };
}

// ---------- Assignments ----------

export async function runAssignment(formData: FormData): Promise<void> {
  const cycleId = str(formData, "cycleId");
  const groupId = str(formData, "groupId");
  if (!cycleId || !groupId) return;

  await mutateDB((db) => {
    const existingForGroup = db.assignments.filter(
      (a) => a.cycleId === cycleId && a.groupId === groupId
    );
    const hasProgress = existingForGroup.some(
      (a) => a.calledAt || a.prayedAt || a.notes
    );
    if (hasProgress) return; // don't clobber tracked progress

    const commitments = db.commitments.filter(
      (c) => c.cycleId === cycleId && c.groupId === groupId
    );
    const members = db.members.filter(
      (m) => m.groupId === groupId && m.active
    );
    if (commitments.length === 0 || members.length === 0) return;

    const pairings = buildAssignmentPairings(commitments, members);

    db.assignments = db.assignments.filter(
      (a) => !(a.cycleId === cycleId && a.groupId === groupId)
    );
    const now = new Date().toISOString();
    for (const pairing of pairings) {
      db.assignments.push({
        id: newId(),
        cycleId,
        groupId,
        commitmentId: pairing.commitmentId,
        partnerMemberId: pairing.partnerMemberId,
        selfAssigned: pairing.selfAssigned,
        calledAt: null,
        prayedAt: null,
        notes: "",
        createdAt: now,
      });
    }
  });

  revalidatePath(`/admin/cycles/${cycleId}`);
  revalidatePath("/my-assignments");
  revalidatePath("/tracking");
}

export async function toggleCalled(formData: FormData): Promise<void> {
  const assignmentId = str(formData, "assignmentId");
  if (!assignmentId) return;
  await mutateDB((db) => {
    const assignment = db.assignments.find((a) => a.id === assignmentId);
    if (assignment) {
      assignment.calledAt = assignment.calledAt ? null : new Date().toISOString();
    }
  });
  revalidatePath("/my-assignments");
  revalidatePath("/tracking");
}

export async function togglePrayed(formData: FormData): Promise<void> {
  const assignmentId = str(formData, "assignmentId");
  if (!assignmentId) return;
  await mutateDB((db) => {
    const assignment = db.assignments.find((a) => a.id === assignmentId);
    if (assignment) {
      assignment.prayedAt = assignment.prayedAt ? null : new Date().toISOString();
    }
  });
  revalidatePath("/my-assignments");
  revalidatePath("/tracking");
}

export async function saveAssignmentNotes(formData: FormData): Promise<void> {
  const assignmentId = str(formData, "assignmentId");
  const notes = str(formData, "notes");
  if (!assignmentId) return;
  await mutateDB((db) => {
    const assignment = db.assignments.find((a) => a.id === assignmentId);
    if (assignment) assignment.notes = notes;
  });
  revalidatePath("/my-assignments");
  revalidatePath("/tracking");
}
