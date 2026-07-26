"use client";

import { useMemo, useState } from "react";
import { toggleCalled, togglePrayed, saveAssignmentNotes } from "@/lib/actions";
import SubmitButton from "@/app/components/SubmitButton";
import ShareCompletionButton from "./ShareCompletionButton";
import type { Assignment, Commitment, Cycle, Member } from "@/lib/types";

function formatDateTime(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function AssignmentsView({
  members,
  cycles,
  commitments,
  assignments,
}: {
  members: Member[];
  cycles: Cycle[];
  commitments: Commitment[];
  assignments: Assignment[];
}) {
  const [memberId, setMemberId] = useState("");

  const activeMembers = useMemo(
    () => [...members].filter((m) => m.active).sort((a, b) => a.name.localeCompare(b.name)),
    [members]
  );

  const cycleById = useMemo(() => new Map(cycles.map((c) => [c.id, c])), [cycles]);
  const commitmentById = useMemo(
    () => new Map(commitments.map((c) => [c.id, c])),
    [commitments]
  );
  const memberById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);

  const myAssignments = useMemo(() => {
    if (!memberId) return [];
    return assignments
      .filter((a) => a.partnerMemberId === memberId)
      .map((a) => ({
        assignment: a,
        commitment: commitmentById.get(a.commitmentId),
        cycle: cycleById.get(a.cycleId),
      }))
      .filter((x) => x.commitment && x.cycle)
      .sort((a, b) =>
        (b.cycle?.weekStart ?? "").localeCompare(a.cycle?.weekStart ?? "")
      );
  }, [assignments, memberId, commitmentById, cycleById]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Your name
          </label>
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              Select your name
            </option>
            {activeMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {memberId && (
        <div className="space-y-4">
          {myAssignments.length === 0 ? (
            <p className="text-sm text-slate-500">
              No assignments yet. Check back after the group&apos;s random
              assignment has been run for this week.
            </p>
          ) : (
            myAssignments.map(({ assignment, commitment, cycle }) => (
              <div
                key={assignment.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {memberById.get(commitment!.memberId)?.name ?? "Unknown"}
                  </h3>
                  <span className="text-xs text-slate-500">{cycle?.label}</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                  &ldquo;{commitment!.obedienceText}&rdquo;
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <a
                    href={`tel:${commitment!.phone}`}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Call {commitment!.phone}
                  </a>
                  <a
                    href={`sms:${commitment!.phone}`}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Text
                  </a>
                </div>

                <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <form action={toggleCalled}>
                    <input type="hidden" name="assignmentId" value={assignment.id} />
                    <SubmitButton
                      pendingLabel="Saving..."
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
                        assignment.calledAt
                          ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                          : "border border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {assignment.calledAt
                        ? `Called ✓ ${formatDateTime(assignment.calledAt)}`
                        : "Mark called"}
                    </SubmitButton>
                  </form>
                  <form action={togglePrayed}>
                    <input type="hidden" name="assignmentId" value={assignment.id} />
                    <SubmitButton
                      pendingLabel="Saving..."
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
                        assignment.prayedAt
                          ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
                          : "border border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {assignment.prayedAt
                        ? `Prayed ✓ ${formatDateTime(assignment.prayedAt)}`
                        : "Mark prayed"}
                    </SubmitButton>
                  </form>
                </div>

                <form action={saveAssignmentNotes} className="flex gap-2 items-start">
                  <input type="hidden" name="assignmentId" value={assignment.id} />
                  <textarea
                    name="notes"
                    defaultValue={assignment.notes}
                    placeholder="Notes from the call (optional)"
                    rows={2}
                    className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                  <SubmitButton className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
                    Save
                  </SubmitButton>
                </form>

                <ShareCompletionButton
                  ownerName={memberById.get(commitment!.memberId)?.name ?? "Unknown"}
                  calledLabel={
                    assignment.calledAt ? formatDateTime(assignment.calledAt) : null
                  }
                  prayedLabel={
                    assignment.prayedAt ? formatDateTime(assignment.prayedAt) : null
                  }
                  notes={assignment.notes}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
