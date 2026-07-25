import Link from "next/link";
import type { Group } from "@/lib/types";

export default function GroupPicker({
  groups,
  basePath,
  title,
}: {
  groups: Group[];
  basePath: string;
  title?: string;
}) {
  return (
    <div className="max-w-sm mx-auto space-y-4">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
        {title ?? "Select your group"}
      </h1>
      {groups.length === 0 ? (
        <p className="text-sm text-slate-500">
          No groups have been set up yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {groups.map((g) => (
            <li key={g.id}>
              <Link
                href={`${basePath}?group=${g.id}`}
                className="block rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {g.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
