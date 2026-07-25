import Link from "next/link";
import { getOpenCycle, getGroups, getCommitments, getMembers } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [cycle, groups, members] = await Promise.all([
    getOpenCycle(),
    getGroups(),
    getMembers(),
  ]);
  const commitments = cycle ? await getCommitments(cycle.id) : [];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Obedience Accountability
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300 max-w-2xl">
          Each week, every man in the Fellowship writes down one specific act
          of obedience to God he&apos;s committing to. That commitment card is
          then randomly handed to another brother in the group, whose job is
          to call, keep him accountable, and pray for him.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">
            This week
          </h2>
          {cycle ? (
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              <p className="font-medium text-slate-800 dark:text-slate-100">
                {cycle.label}
              </p>
              <p>
                {commitments.length} commitment{commitments.length === 1 ? "" : "s"}{" "}
                submitted so far across {groups.length} group
                {groups.length === 1 ? "" : "s"}.
              </p>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              No week is open right now. An admin needs to start a new week.
            </p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">
            Fellowship size
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            {groups.length} group{groups.length === 1 ? "" : "s"},{" "}
            {members.length} member{members.length === 1 ? "" : "s"}.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
          The weekly steps
        </h2>
        <ol className="space-y-2 text-sm text-slate-600 dark:text-slate-300 list-decimal list-inside">
          <li>
            Every member{" "}
            <Link href="/submit" className="text-blue-600 dark:text-blue-400 underline">
              submits their obedience commitment
            </Link>{" "}
            for the week, with their name and phone number.
          </li>
          <li>
            An admin runs the random assignment for each group, pairing every
            commitment card with a different member of that group.
          </li>
          <li>
            Each member checks{" "}
            <Link href="/my-assignments" className="text-blue-600 dark:text-blue-400 underline">
              My Assignments
            </Link>{" "}
            to see who they&apos;ve been assigned, calls them, prays for them,
            and marks it done.
          </li>
          <li>
            Everyone can watch progress on the{" "}
            <Link href="/tracking" className="text-blue-600 dark:text-blue-400 underline">
              Tracking
            </Link>{" "}
            page.
          </li>
        </ol>
      </section>
    </div>
  );
}
