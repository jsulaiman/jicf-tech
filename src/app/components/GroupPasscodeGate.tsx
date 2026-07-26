import { unlockGroup } from "@/lib/actions";
import SubmitButton from "@/app/components/SubmitButton";
import type { Group } from "@/lib/types";

export default function GroupPasscodeGate({
  group,
  returnTo,
  hasError,
}: {
  group: Group;
  returnTo: string;
  hasError: boolean;
}) {
  if (!group.passcode) {
    return (
      <div className="max-w-sm mx-auto space-y-4">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {group.name}
        </h1>
        <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg p-3">
          This group doesn&apos;t have a passcode set up yet. Ask an admin to
          set one in Admin &rarr; Groups.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {group.name}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Enter your group&apos;s passcode to continue. Ask your group leader
          if you don&apos;t have it.
        </p>
      </div>
      <form action={unlockGroup} className="space-y-4">
        <input type="hidden" name="groupId" value={group.id} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Group passcode
          </label>
          <input
            type="text"
            name="passcode"
            required
            autoFocus
            autoCapitalize="characters"
            autoComplete="off"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm tracking-widest uppercase"
          />
        </div>
        {hasError ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            Incorrect passcode. Try again.
          </p>
        ) : null}
        <SubmitButton className="w-full rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50">
          Continue
        </SubmitButton>
      </form>
    </div>
  );
}
