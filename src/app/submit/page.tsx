import { getOpenCycle, getGroups, getMembers, getCommitments } from "@/lib/repo";
import SubmitForm from "./SubmitForm";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const cycle = await getOpenCycle();
  const groups = await getGroups();
  const members = await getMembers();
  const commitments = cycle ? await getCommitments(cycle.id) : [];

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Submit Your Obedience Commitment
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          What is one specific act of obedience to God you&apos;re committing
          to this week? Be concrete — something a brother can actually follow
          up with you about.
        </p>
      </div>

      {!cycle ? (
        <p className="rounded-lg border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm text-amber-700 dark:text-amber-300">
          No week is currently open for submissions. Check back once an admin
          starts the new week.
        </p>
      ) : groups.length === 0 ? (
        <p className="text-sm text-slate-500">
          No groups have been set up yet.
        </p>
      ) : (
        <SubmitForm
          cycleId={cycle.id}
          groups={groups}
          members={members}
          commitments={commitments}
        />
      )}
    </div>
  );
}
