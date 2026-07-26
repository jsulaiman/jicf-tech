import { notFound } from "next/navigation";
import {
  getCycles,
  getGroups,
  getGroup,
  getMembers,
  getCommitmentsForGroup,
  getAssignmentsForGroup,
} from "@/lib/repo";
import { hasGroupAccess } from "@/lib/groupAccess";
import { buildGroupSummaryText } from "@/lib/shareText";
import GroupPicker from "@/app/components/GroupPicker";
import GroupPasscodeGate from "@/app/components/GroupPasscodeGate";
import CycleSelect from "./CycleSelect";

export const dynamic = "force-dynamic";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default async function TrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ cycle?: string; group?: string; passcodeError?: string }>;
}) {
  const { cycle: cycleParam, group: groupId, passcodeError } = await searchParams;

  if (!groupId) {
    const groups = await getGroups();
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <GroupPicker groups={groups} basePath="/tracking" title="Tracking" />
      </div>
    );
  }

  const group = await getGroup(groupId);
  if (!group) notFound();

  const unlocked = await hasGroupAccess(group);
  if (!unlocked) {
    const returnTo = `/tracking?group=${groupId}${cycleParam ? `&cycle=${cycleParam}` : ""}`;
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <GroupPasscodeGate group={group} returnTo={returnTo} hasError={passcodeError === "1"} />
      </div>
    );
  }

  const cycles = await getCycles();

  if (cycles.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Tracking
        </h1>
        <p className="mt-4 text-sm text-slate-500">
          No weeks have been created yet.
        </p>
      </div>
    );
  }

  const selectedCycle =
    cycles.find((c) => c.id === cycleParam) ??
    cycles.find((c) => c.status === "open") ??
    cycles[0];

  const [members, groupCommitments, groupAssignments] = await Promise.all([
    getMembers(groupId),
    getCommitmentsForGroup(groupId),
    getAssignmentsForGroup(groupId),
  ]);

  const activeMembers = members
    .filter((m) => m.active)
    .sort((a, b) => a.name.localeCompare(b.name));
  const commitments = groupCommitments.filter((c) => c.cycleId === selectedCycle.id);
  const assignments = groupAssignments.filter((a) => a.cycleId === selectedCycle.id);
  const memberById = new Map(members.map((m) => [m.id, m]));

  const rows = activeMembers.map((member) => {
    const commitment = commitments.find((c) => c.memberId === member.id);
    const assignment = commitment
      ? assignments.find((a) => a.commitmentId === commitment.id)
      : undefined;
    const partner = assignment ? memberById.get(assignment.partnerMemberId) : undefined;
    return { member, commitment, assignment, partner };
  });

  const totalActive = rows.length;
  const totalSubmitted = rows.filter((r) => r.commitment).length;
  const totalAssigned = rows.filter((r) => r.assignment).length;
  const totalCalled = rows.filter((r) => r.assignment?.calledAt).length;
  const totalPrayed = rows.filter((r) => r.assignment?.prayedAt).length;

  const pendingCalls = rows
    .filter((r) => r.assignment && !r.assignment.calledAt)
    .map((r) => `${r.member.name} (partner: ${r.partner?.name ?? "Unknown"})`);

  const summaryShareText = buildGroupSummaryText(
    group.name,
    selectedCycle.label,
    {
      totalActive,
      submitted: totalSubmitted,
      assigned: totalAssigned,
      called: totalCalled,
      prayed: totalPrayed,
    },
    pendingCalls
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Tracking
          </h1>
          <p className="text-sm text-slate-500">{group.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <CycleSelect cycles={cycles} selectedCycleId={selectedCycle.id} groupId={groupId} />
          <a
            href={`https://wa.me/?text=${encodeURIComponent(summaryShareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-green-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-green-700 whitespace-nowrap"
          >
            Share weekly summary
          </a>
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Submitted", value: totalSubmitted, total: totalActive },
          { label: "Assigned", value: totalAssigned, total: totalSubmitted },
          { label: "Called", value: totalCalled, total: totalAssigned },
          { label: "Prayed", value: totalPrayed, total: totalAssigned },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900"
          >
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {stat.value}/{stat.total}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">No active members.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="pb-2 pr-4">Member</th>
                  <th className="pb-2 pr-4">Submitted</th>
                  <th className="pb-2 pr-4">Partner</th>
                  <th className="pb-2 pr-4">Called</th>
                  <th className="pb-2">Prayed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ member, commitment, assignment, partner }) => (
                  <tr
                    key={member.id}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="py-2 pr-4 font-medium text-slate-800 dark:text-slate-200">
                      {member.name}
                    </td>
                    <td className="py-2 pr-4">
                      {commitment ? (
                        <span className="text-green-700 dark:text-green-400">
                          ✓ {formatDate(commitment.submittedAt)}
                        </span>
                      ) : (
                        <span className="text-slate-400">not yet</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {partner ? (
                        partner.name
                      ) : commitment ? (
                        <span className="text-amber-600 dark:text-amber-400">
                          not yet assigned
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      {assignment?.calledAt ? (
                        <span className="text-green-700 dark:text-green-400">
                          ✓ {formatDate(assignment.calledAt)}
                        </span>
                      ) : assignment ? (
                        <span className="text-amber-600 dark:text-amber-400">pending</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2">
                      {assignment?.prayedAt ? (
                        <span className="text-green-700 dark:text-green-400">
                          ✓ {formatDate(assignment.prayedAt)}
                        </span>
                      ) : assignment ? (
                        <span className="text-amber-600 dark:text-amber-400">pending</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
