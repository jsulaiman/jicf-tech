import Link from "next/link";
import { getGroups, getMembers, getCycles, getCommitments } from "@/lib/repo";
import { createCycle, logoutAdmin } from "@/lib/actions";
import SubmitButton from "@/app/components/SubmitButton";

export const dynamic = "force-dynamic";

function defaultWeekStart(): string {
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMonday);
  return monday.toISOString().slice(0, 10);
}

function defaultLabel(): string {
  const d = new Date();
  return `Week of ${d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
}

export default async function AdminHomePage() {
  const [groups, members, cycles] = await Promise.all([
    getGroups(),
    getMembers(),
    getCycles(),
  ]);
  const memberCountByGroup = new Map<string, number>();
  for (const m of members) {
    memberCountByGroup.set(m.groupId, (memberCountByGroup.get(m.groupId) ?? 0) + 1);
  }

  const commitmentCounts = new Map<string, number>();
  for (const cycle of cycles) {
    const commitments = await getCommitments(cycle.id);
    commitmentCounts.set(cycle.id, commitments.length);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Admin
        </h1>
        <form action={logoutAdmin}>
          <button className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline">
            Sign out
          </button>
        </form>
      </div>

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">
            Groups
          </h2>
          <Link
            href="/admin/groups"
            className="text-sm text-blue-600 dark:text-blue-400 underline"
          >
            Manage groups &amp; members
          </Link>
        </div>
        {groups.length === 0 ? (
          <p className="text-sm text-slate-500">
            No groups yet.{" "}
            <Link href="/admin/groups" className="underline">
              Create your first group
            </Link>
            .
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {groups.map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm"
              >
                <span>{g.name}</span>
                <span className="text-slate-500">
                  {memberCountByGroup.get(g.id) ?? 0} members
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Start a new week
        </h2>
        <form action={createCycle} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Label
            </label>
            <input
              name="label"
              defaultValue={defaultLabel()}
              required
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Week start
            </label>
            <input
              type="date"
              name="weekStart"
              defaultValue={defaultWeekStart()}
              required
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
            />
          </div>
          <SubmitButton className="rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">
            Start new week
          </SubmitButton>
        </form>
        <p className="mt-2 text-xs text-slate-500">
          Starting a new week automatically closes submissions for the
          previous one. Past weeks stay visible in Tracking.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Weeks
        </h2>
        {cycles.length === 0 ? (
          <p className="text-sm text-slate-500">No weeks created yet.</p>
        ) : (
          <ul className="space-y-2">
            {cycles.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/admin/cycles/${c.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 text-sm hover:border-blue-400"
                >
                  <span>
                    {c.label}{" "}
                    <span
                      className={
                        c.status === "open"
                          ? "ml-2 rounded-full bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 px-2 py-0.5 text-xs"
                          : "ml-2 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 text-xs"
                      }
                    >
                      {c.status}
                    </span>
                  </span>
                  <span className="text-slate-500">
                    {commitmentCounts.get(c.id) ?? 0} commitments
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
