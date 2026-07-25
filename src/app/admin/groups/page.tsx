import Link from "next/link";
import { getGroups, getMembers } from "@/lib/repo";
import { createGroup, deleteGroup } from "@/lib/actions";
import SubmitButton from "@/app/components/SubmitButton";

export const dynamic = "force-dynamic";

export default async function AdminGroupsPage() {
  const [groups, members] = await Promise.all([getGroups(), getMembers()]);
  const memberCountByGroup = new Map<string, number>();
  for (const m of members) {
    memberCountByGroup.set(m.groupId, (memberCountByGroup.get(m.groupId) ?? 0) + 1);
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin" className="text-sm text-blue-600 dark:text-blue-400 underline">
          &larr; Back to admin
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
          Groups
        </h1>
      </div>

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Create a group
        </h2>
        <form action={createGroup} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Group name
            </label>
            <input
              name="name"
              required
              placeholder="e.g. Group 1"
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
            />
          </div>
          <SubmitButton className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">
            Add group
          </SubmitButton>
        </form>
      </section>

      <section className="space-y-3">
        {groups.length === 0 ? (
          <p className="text-sm text-slate-500">No groups yet.</p>
        ) : (
          groups.map((g) => (
            <div
              key={g.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {g.name}
                </p>
                <p className="text-xs text-slate-500">
                  {memberCountByGroup.get(g.id) ?? 0} members
                  {g.passcode ? (
                    <>
                      {" "}
                      &middot; passcode{" "}
                      <span className="font-mono tracking-wider text-slate-700 dark:text-slate-300">
                        {g.passcode}
                      </span>
                    </>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">
                      {" "}
                      &middot; no passcode set
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/groups/${g.id}`}
                  className="text-sm text-blue-600 dark:text-blue-400 underline"
                >
                  Manage members
                </Link>
                {(memberCountByGroup.get(g.id) ?? 0) === 0 && (
                  <form action={deleteGroup}>
                    <input type="hidden" name="groupId" value={g.id} />
                    <button className="text-sm text-red-600 dark:text-red-400 underline">
                      Delete
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
