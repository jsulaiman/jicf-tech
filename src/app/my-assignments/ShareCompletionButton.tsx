"use client";

import { useMemo, useState } from "react";

export default function ShareCompletionButton({
  ownerName,
  calledLabel,
  prayedLabel,
  notes,
}: {
  ownerName: string;
  calledLabel: string | null;
  prayedLabel: string | null;
  notes: string;
}) {
  const [includeNotes, setIncludeNotes] = useState(false);
  const hasNotes = notes.trim().length > 0;
  const canShare = Boolean(calledLabel || prayedLabel);

  const actionLabel = [calledLabel && "Called", prayedLabel && "Prayed"]
    .filter(Boolean)
    .join(" & ");

  const message = useMemo(() => {
    const lines = [
      `✅ Accountability check-in for ${ownerName}`,
      actionLabel && `Action: ${actionLabel}`,
      calledLabel && `Called: ${calledLabel}`,
      prayedLabel && `Prayed: ${prayedLabel}`,
      includeNotes && hasNotes ? `Notes: ${notes.trim()}` : null,
    ];
    return lines.filter(Boolean).join("\n");
  }, [ownerName, actionLabel, calledLabel, prayedLabel, includeNotes, hasNotes, notes]);

  if (!canShare) return null;

  return (
    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
      {hasNotes && (
        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={includeNotes}
            onChange={(e) => setIncludeNotes(e.target.checked)}
          />
          Include call notes in the shared message
        </label>
      )}
      <a
        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block rounded-lg bg-green-600 text-white px-3 py-1.5 text-sm font-medium hover:bg-green-700"
      >
        Share to WhatsApp
      </a>
    </div>
  );
}
