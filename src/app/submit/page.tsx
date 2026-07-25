import { notFound } from "next/navigation";
import { getOpenCycle, getGroups, getGroup, getMembers, getCommitments } from "@/lib/repo";
import { hasGroupAccess } from "@/lib/groupAccess";
import GroupPicker from "@/app/components/GroupPicker";
import GroupPasscodeGate from "@/app/components/GroupPasscodeGate";
import SubmitForm from "./SubmitForm";

export const dynamic = "force-dynamic";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; passcodeError?: string }>;
}) {
  const { group: groupId, passcodeError } = await searchParams;

  if (!groupId) {
    const groups = await getGroups();
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <GroupPicker
          groups={groups}
          basePath="/submit"
          title="Submit Your Obedience Commitment"
        />
      </div>
    );
  }

  const group = await getGroup(groupId);
  if (!group) notFound();

  const unlocked = await hasGroupAccess(group);
  if (!unlocked) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <GroupPasscodeGate
          group={group}
          returnTo={`/submit?group=${groupId}`}
          hasError={passcodeError === "1"}
        />
      </div>
    );
  }

  const cycle = await getOpenCycle();
  const members = await getMembers(groupId);
  const commitments = cycle
    ? (await getCommitments(cycle.id)).filter((c) => c.groupId === groupId)
    : [];

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Submit Your Obedience Commitment
        </h1>
        <p className="mt-1 text-sm text-slate-500">{group.name}</p>
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
      ) : members.length === 0 ? (
        <p className="text-sm text-slate-500">
          No members found in this group yet — ask an admin to add you.
        </p>
      ) : (
        <SubmitForm
          cycleId={cycle.id}
          groupId={groupId}
          members={members}
          commitments={commitments}
        />
      )}
    </div>
  );
}
