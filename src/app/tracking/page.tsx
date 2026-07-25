import { getCycles, getFullState } from "@/lib/repo";
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
  searchParams: Promise<{ cycle?: string }>;
}) {
  const { cycle: cycleParam } = await searchParams;
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

  const db = await getFullState();
  const groups = [...db.groups].sort((a, b) => a.name.localeCompare(b.name));
  const members = db.members;
  const commitments = db.commitments.filter((c) => c.cycleId === selectedCycle.id);
  const assignments = db.assignments.filter((a) => a.cycleId === selectedCycle.id);
  const memberById = new Map(members.map((m) => [m.id, m]));

  const groupRows = groups.map((group) => {
    const groupMembers = members
      .filter((m) => m.groupId === group.id && m.active)
      .sort((a, b) => a.name.localeCompare(b.name));

    const rows = groupMembers.map((member) => {
      const commitment = commitments.find((c) => c.memberId === member.id);
      const assignment = commitment
        ? assignments.find((a) => a.commitmentId === commitment.id)
        : undefined;
      const partner = assignment ? memberById.get(assignment.partnerMemberId) : undefined;

      return { member, commitment, assignment, partner };
    });

    return { group, rows };
  });

  const allRows = groupRows.flatMap((g) => g.rows);
  const totalActive = allRows.length;
  const totalSubmitted = allRows.filter((r) => r.commitment).length;
  const totalAssigned = allRows.filter((r) => r.assignment).length;
  const totalCalled = allRows.filter((r) => r.assignment?.calledAt).length;
  const totalPrayed = allRows.filter((r) => r.assignment?.prayedAt).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Tracking
        </h1>
        <CycleSelect cycles={cycles} selectedCycleId={selectedCycle.id} />
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

      {groupRows.map(({ group, rows }) => (
        <section
          key={group.id}
          className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900"
        >
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
            {group.name}
          </h2>
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
      ))}
    </div>
  );
}
