"use client";

import { useMemo, useState, useTransition } from "react";
import { submitCommitment } from "@/lib/actions";
import type { Commitment, Member } from "@/lib/types";

export default function SubmitForm({
  cycleId,
  groupId,
  members,
  commitments,
}: {
  cycleId: string;
  groupId: string;
  members: Member[];
  commitments: Commitment[];
}) {
  const [memberId, setMemberId] = useState("");
  const [obedienceText, setObedienceText] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<{ ok?: boolean; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeMembers = useMemo(() => members.filter((m) => m.active), [members]);

  const commitmentByMemberId = useMemo(() => {
    const map = new Map<string, Commitment>();
    for (const c of commitments) map.set(c.memberId, c);
    return map;
  }, [commitments]);

  function handleMemberChange(newMemberId: string) {
    setMemberId(newMemberId);
    setResult(null);
    const existing = commitmentByMemberId.get(newMemberId);
    if (existing) {
      setObedienceText(existing.obedienceText);
      setPhone(existing.phone);
    } else {
      const member = members.find((m) => m.id === newMemberId);
      setObedienceText("");
      setPhone(member?.phone ?? "");
    }
  }

  const alreadySubmitted = memberId ? commitmentByMemberId.has(memberId) : false;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await submitCommitment(formData);
      setResult(res);
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <input type="hidden" name="cycleId" value={cycleId} />
      <input type="hidden" name="groupId" value={groupId} />

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Your name
        </label>
        <select
          name="memberId"
          value={memberId}
          onChange={(e) => handleMemberChange(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
        >
          <option value="" disabled>
            Select your name
          </option>
          {activeMembers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {memberId && (
        <>
          {alreadySubmitted && (
            <p className="text-xs text-blue-600 dark:text-blue-400">
              You&apos;ve already submitted for this week. Saving again will
              update your commitment.
            </p>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              This week I will obey God by...
            </label>
            <textarea
              name="obedienceText"
              value={obedienceText}
              onChange={(e) => setObedienceText(e.target.value)}
              required
              rows={4}
              placeholder="e.g. Having a hard conversation with my dad I've been avoiding, and praying about it every morning."
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Phone number
            </label>
            <input
              name="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+62 812 3456 7890"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-slate-500">
              So whoever gets assigned your card can call you.
            </p>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Submit commitment"}
          </button>
        </>
      )}

      {result?.ok && (
        <p className="rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 p-3 text-sm text-green-700 dark:text-green-300">
          Commitment saved. Thank you for stepping out in obedience.
        </p>
      )}
      {result?.error && (
        <p className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-3 text-sm text-red-700 dark:text-red-300">
          {result.error}
        </p>
      )}
    </form>
  );
}
