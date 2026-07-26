import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCycle,
  getGroups,
  getMembers,
  getCommitments,
  getAssignments,
} from "@/lib/repo";
import { runAssignment, closeCycle, reopenCycle } from "@/lib/actions";
import SubmitButton from "@/app/components/SubmitButton";
import { buildGroupSummaryText, buildMinistrySummaryText } from "@/lib/shareText";
import type { Member } from "@/lib/types";

export const dynamic = "force-dynamic";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildAssignmentShareText(
  groupName: string,
  cycleLabel: string,
  pairs: { ownerName: string; partnerName: string; selfAssigned: boolean }[]
): string {
  const lines = pairs.map(
    ({ ownerName, partnerName, selfAssigned }) =>
      `• ${ownerName} → ${partnerName}${selfAssigned ? " (no partner available)" : ""}`
  );
  return `📋 *${groupName}* — ${cycleLabel}\nAccountability assignments:\n${lines.join("\n")}`;
}

export default async function AdminCyclePage({
  params,
}: {
  params: Promise<{ cycleId: string }>;
}) {
  const { cycleId } = await params;
  const cycle = await getCycle(cycleId);
  if (!cycle) notFound();

  const [groups, allMembers, commitments, assignments] = await Promise.all([
    getGroups(),
    getMembers(),
    getCommitments(cycleId),
    getAssignments(cycleId),
  ]);

  const memberById = new Map<string, Member>(allMembers.map((m) => [m.id, m]));

  const groupStats = groups.map((group) => {
    const groupMembers = allMembers.filter(
      (m) => m.groupId === group.id && m.active
    );
    const groupCommitments = commitments.filter((c) => c.groupId === group.id);
    const groupAssignments = assignments.filter((a) => a.groupId === group.id);
    const pendingCalls = groupAssignments
      .filter((a) => !a.calledAt)
      .map((a) => {
        const commitment = groupCommitments.find((c) => c.id === a.commitmentId);
        const owner = commitment ? memberById.get(commitment.memberId) : undefined;
        const partner = memberById.get(a.partnerMemberId);
        return `${owner?.name ?? "Unknown"} (partner: ${partner?.name ?? "Unknown"})`;
      });
    return {
      group,
      totalActive: groupMembers.length,
      submitted: groupCommitments.length,
      assigned: groupAssignments.length,
      called: groupAssignments.filter((a) => a.calledAt).length,
      prayed: groupAssignments.filter((a) => a.prayedAt).length,
      pendingCalls,
    };
  });

  const ministryTotals = groupStats.reduce(
    (acc, g) => ({
      totalActive: acc.totalActive + g.totalActive,
      submitted: acc.submitted + g.submitted,
      assigned: acc.assigned + g.assigned,
      called: acc.called + g.called,
      prayed: acc.prayed + g.prayed,
    }),
    { totalActive: 0, submitted: 0, assigned: 0, called: 0, prayed: 0 }
  );

  const ministryShareText = buildMinistrySummaryText(
    cycle.label,
    ministryTotals,
    groupStats.map((g) => ({ groupName: g.group.name, ...g }))
  );

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin" className="text-sm text-blue-600 dark:text-blue-400 underline">
          &larr; Back to admin
        </Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {cycle.label}
          </h1>
          {cycle.status === "open" ? (
            <form action={closeCycle}>
              <input type="hidden" name="cycleId" value={cycle.id} />
              <SubmitButton className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
                Close this week
              </SubmitButton>
            </form>
          ) : (
            <form action={reopenCycle}>
              <input type="hidden" name="cycleId" value={cycle.id} />
              <SubmitButton className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
                Reopen for submissions
              </SubmitButton>
            </form>
          )}
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">
            Ministry-wide summary
          </h2>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(ministryShareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-green-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-green-700"
          >
            Share to WhatsApp
          </a>
        </div>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { label: "Submitted", value: ministryTotals.submitted, total: ministryTotals.totalActive },
            { label: "Assigned", value: ministryTotals.assigned, total: ministryTotals.submitted },
            { label: "Called", value: ministryTotals.called, total: ministryTotals.assigned },
            { label: "Prayed", value: ministryTotals.prayed, total: ministryTotals.assigned },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-slate-200 dark:border-slate-800 p-3"
            >
              <p className="text-xs text-slate-500">{stat.label}</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {stat.value}/{stat.total}
              </p>
            </div>
          ))}
        </div>
      </section>

      {groupStats.map(({ group, ...stats }) => {
        const groupCommitments = commitments.filter(
          (c) => c.groupId === group.id
        );
        const groupAssignments = assignments.filter(
          (a) => a.groupId === group.id
        );
        const hasProgress = groupAssignments.some(
          (a) => a.calledAt || a.prayedAt || a.notes
        );
        const groupSummaryShareText = buildGroupSummaryText(
          group.name,
          cycle.label,
          stats,
          stats.pendingCalls
        );

        return (
          <section
            key={group.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                {group.name}
              </h2>
              <span className="text-sm text-slate-500">
                {groupCommitments.length}/{stats.totalActive} submitted
              </span>
            </div>

            {groupCommitments.length === 0 ? (
              <p className="text-sm text-slate-500">
                No commitments submitted yet.
              </p>
            ) : groupAssignments.length === 0 ? (
              <div className="space-y-3">
                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                  {groupCommitments.map((c) => (
                    <li key={c.id}>{memberById.get(c.memberId)?.name ?? "Unknown"}</li>
                  ))}
                </ul>
                <form action={runAssignment}>
                  <input type="hidden" name="cycleId" value={cycle.id} />
                  <input type="hidden" name="groupId" value={group.id} />
                  <SubmitButton className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">
                    Run random assignment
                  </SubmitButton>
                </form>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500">
                        <th className="pb-2 pr-4">Commitment by</th>
                        <th className="pb-2 pr-4">Accountability partner</th>
                        <th className="pb-2 pr-4">Called</th>
                        <th className="pb-2">Prayed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupAssignments.map((a) => {
                        const commitment = groupCommitments.find(
                          (c) => c.id === a.commitmentId
                        );
                        const owner = commitment
                          ? memberById.get(commitment.memberId)
                          : undefined;
                        const partner = memberById.get(a.partnerMemberId);
                        return (
                          <tr
                            key={a.id}
                            className="border-t border-slate-100 dark:border-slate-800"
                          >
                            <td className="py-2 pr-4">
                              {owner?.name ?? "Unknown"}
                              {a.selfAssigned && (
                                <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                                  (self — no partner available)
                                </span>
                              )}
                            </td>
                            <td className="py-2 pr-4">{partner?.name ?? "Unknown"}</td>
                            <td className="py-2 pr-4">
                              {a.calledAt ? formatDate(a.calledAt) : "—"}
                            </td>
                            <td className="py-2">
                              {a.prayedAt ? formatDate(a.prayedAt) : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {hasProgress ? (
                    <p className="text-xs text-slate-500">
                      Assignment locked — calls or prayers have already been
                      logged this week.
                    </p>
                  ) : (
                    <form action={runAssignment}>
                      <input type="hidden" name="cycleId" value={cycle.id} />
                      <input type="hidden" name="groupId" value={group.id} />
                      <SubmitButton className="text-sm text-slate-500 underline disabled:opacity-50">
                        Re-shuffle assignment
                      </SubmitButton>
                    </form>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        buildAssignmentShareText(
                          group.name,
                          cycle.label,
                          groupAssignments.map((a) => {
                            const commitment = groupCommitments.find(
                              (c) => c.id === a.commitmentId
                            );
                            const owner = commitment
                              ? memberById.get(commitment.memberId)
                              : undefined;
                            const partner = memberById.get(a.partnerMemberId);
                            return {
                              ownerName: owner?.name ?? "Unknown",
                              partnerName: partner?.name ?? "Unknown",
                              selfAssigned: a.selfAssigned,
                            };
                          })
                        )
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-lg border border-green-600 text-green-700 dark:text-green-400 px-3 py-1.5 text-sm font-medium hover:bg-green-50 dark:hover:bg-green-950/40"
                    >
                      Share assignments
                    </a>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(groupSummaryShareText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-lg bg-green-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-green-700"
                    >
                      Share weekly summary
                    </a>
                  </div>
                </div>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
