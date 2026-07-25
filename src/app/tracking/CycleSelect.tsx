"use client";

import { useRouter } from "next/navigation";
import type { Cycle } from "@/lib/types";

export default function CycleSelect({
  cycles,
  selectedCycleId,
  groupId,
}: {
  cycles: Cycle[];
  selectedCycleId: string;
  groupId: string;
}) {
  const router = useRouter();

  return (
    <select
      value={selectedCycleId}
      onChange={(e) =>
        router.push(`/tracking?group=${groupId}&cycle=${e.target.value}`)
      }
      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm"
    >
      {cycles.map((c) => (
        <option key={c.id} value={c.id}>
          {c.label} {c.status === "open" ? "(open)" : ""}
        </option>
      ))}
    </select>
  );
}
