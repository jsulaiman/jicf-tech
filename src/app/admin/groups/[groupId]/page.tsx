import Link from "next/link";
import { notFound } from "next/navigation";
import { getGroup, getMembers } from "@/lib/repo";
import {
  addMember,
  updateMember,
  setMemberActive,
  renameGroup,
  regenerateGroupPasscode,
  setGroupPasscode,
} from "@/lib/actions";
import SubmitButton from "@/app/components/SubmitButton";

export const dynamic = "force-dynamic";

export default async function AdminGroupMembersPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;
  const group = await getGroup(groupId);
  if (!group) notFound();
  const members = await getMembers(groupId);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/groups" className="text-sm text-blue-600 dark:text-blue-400 underline">
          &larr; Back to groups
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
          {group.name}
        </h1>
      </div>

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Rename group
        </h2>
        <form action={renameGroup} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="groupId" value={group.id} />
          <input
            name="name"
            defaultValue={group.name}
            required
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
          />
          <SubmitButton className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
            Save name
          </SubmitButton>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Member passcode
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
          Members enter this to view {group.name}&apos;s submit, my
          assignments, and tracking pages. Share it only with this group.
          Regenerating or changing it signs out anyone currently using it.
        </p>
        {group.passcode ? (
          <p className="mb-3 text-lg font-mono tracking-widest text-slate-900 dark:text-slate-100">
            {group.passcode}
          </p>
        ) : (
          <p className="mb-3 text-sm text-amber-600 dark:text-amber-400">
            No passcode set yet — members can&apos;t access this group until
            you set one.
          </p>
        )}
        <div className="flex flex-wrap items-end gap-3">
          <form action={regenerateGroupPasscode}>
            <input type="hidden" name="groupId" value={group.id} />
            <SubmitButton className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
              Generate new random passcode
            </SubmitButton>
          </form>
          <form action={setGroupPasscode} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="groupId" value={group.id} />
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Or set a custom passcode
              </label>
              <input
                name="passcode"
                placeholder="e.g. GROUP1"
                className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm font-mono tracking-wider uppercase"
              />
            </div>
            <SubmitButton className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
              Save
            </SubmitButton>
          </form>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Add a member
        </h2>
        <form action={addMember} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="groupId" value={group.id} />
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Name
            </label>
            <input
              name="name"
              required
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Phone number
            </label>
            <input
              name="phone"
              type="tel"
              required
              placeholder="+62 812 3456 7890"
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
            />
          </div>
          <SubmitButton className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">
            Add member
          </SubmitButton>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">
          Members ({members.length})
        </h2>
        {members.length === 0 ? (
          <p className="text-sm text-slate-500">No members yet.</p>
        ) : (
          members.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl border p-4 bg-white dark:bg-slate-900 ${
                m.active
                  ? "border-slate-200 dark:border-slate-800"
                  : "border-slate-200 dark:border-slate-800 opacity-60"
              }`}
            >
              <form
                action={updateMember}
                className="flex flex-wrap items-end gap-3"
              >
                <input type="hidden" name="memberId" value={m.id} />
                <input type="hidden" name="groupId" value={group.id} />
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Name
                  </label>
                  <input
                    name="name"
                    defaultValue={m.name}
                    required
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Phone
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={m.phone}
                    required
                    className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
                  />
                </div>
                <SubmitButton className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">
                  Save
                </SubmitButton>
              </form>
              <form action={setMemberActive} className="mt-2">
                <input type="hidden" name="memberId" value={m.id} />
                <input type="hidden" name="groupId" value={group.id} />
                <input type="hidden" name="active" value={(!m.active).toString()} />
                <SubmitButton className="text-xs text-slate-500 underline disabled:opacity-50">
                  {m.active ? "Deactivate (hide from new weeks)" : "Reactivate"}
                </SubmitButton>
              </form>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
