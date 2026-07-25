import { getFullState } from "@/lib/repo";
import AssignmentsView from "./AssignmentsView";

export const dynamic = "force-dynamic";

export default async function MyAssignmentsPage() {
  const db = await getFullState();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          My Assignments
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          See who you&apos;ve been assigned to keep accountable. Call them,
          pray for their commitment, and mark it off once you have.
        </p>
      </div>

      <AssignmentsView
        groups={db.groups}
        members={db.members}
        cycles={db.cycles}
        commitments={db.commitments}
        assignments={db.assignments}
      />
    </div>
  );
}
