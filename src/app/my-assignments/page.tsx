import { notFound } from "next/navigation";
import {
  getGroups,
  getGroup,
  getMembers,
  getCycles,
  getCommitmentsForGroup,
  getAssignmentsForGroup,
} from "@/lib/repo";
import { hasGroupAccess } from "@/lib/groupAccess";
import GroupPicker from "@/app/components/GroupPicker";
import GroupPasscodeGate from "@/app/components/GroupPasscodeGate";
import AssignmentsView from "./AssignmentsView";

export const dynamic = "force-dynamic";

export default async function MyAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; passcodeError?: string }>;
}) {
  const { group: groupId, passcodeError } = await searchParams;

  if (!groupId) {
    const groups = await getGroups();
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <GroupPicker groups={groups} basePath="/my-assignments" title="My Assignments" />
      </div>
    );
  }

  const group = await getGroup(groupId);
  if (!group) notFound();

  const unlocked = await hasGroupAccess(group);
  if (!unlocked) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <GroupPasscodeGate
          group={group}
          returnTo={`/my-assignments?group=${groupId}`}
          hasError={passcodeError === "1"}
        />
      </div>
    );
  }

  const [members, cycles, commitments, assignments] = await Promise.all([
    getMembers(groupId),
    getCycles(),
    getCommitmentsForGroup(groupId),
    getAssignmentsForGroup(groupId),
  ]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          My Assignments
        </h1>
        <p className="mt-1 text-sm text-slate-500">{group.name}</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          See who you&apos;ve been assigned to keep accountable. Call them,
          pray for their commitment, and mark it off once you have.
        </p>
      </div>

      <AssignmentsView
        members={members}
        cycles={cycles}
        commitments={commitments}
        assignments={assignments}
      />
    </div>
  );
}
