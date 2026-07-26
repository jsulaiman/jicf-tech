# JICF Men's Fellowship — Obedience Accountability

A weekly obedience-accountability tracker for JICF Men's Fellowship small
groups (up to ~7 people per group, ~10 groups).

Each week:

1. Every member submits the specific act of obedience to God he's
   committing to, plus his name and phone number.
2. An admin runs a random assignment per group: every commitment card is
   handed to a different member of that same group (never back to the
   person who wrote it).
3. That member calls the person, prays for the commitment, and marks the
   call and the prayer as done, with optional notes.
4. Everyone can watch submission / assignment / call / prayer status for
   the week on the Tracking page.

## Stack

- Next.js 16 (App Router, Server Actions) + React 19 + TypeScript
- Tailwind CSS 4
- Data storage: Postgres, via `src/lib/db.ts`. All app state (groups,
  members, cycles, commitments, assignments) lives as a single JSONB blob
  in one row — intentionally simple for a group this size (a few hundred
  records a year), while still persisting correctly across the
  short-lived, multi-instance processes serverless deployments use. The
  table is created automatically on first use.

## Getting started

```bash
npm install
cp .env.example .env.local   # then edit ADMIN_PASSWORD and POSTGRES_URL
npm run dev
```

Open http://localhost:3000.

- `/` — overview
- `/submit` — members submit their weekly obedience commitment
- `/my-assignments` — members see who they've been assigned to call, mark
  called/prayed, and leave notes
- `/tracking` — read-only dashboard of submitted/assigned/called/prayed
  status per group, per week
- `/admin` — create groups & members, start/close weekly cycles, run the
  random assignment (password-protected, see below)

## Admin access

`/admin/*` is protected by a single shared password, set via the
`ADMIN_PASSWORD` environment variable (see `.env.example`). Without it set,
the admin login page shows a setup message and refuses all logins. There is
no per-admin account system — this is meant for the one or two people who
run the Fellowship's groups, not for end members.

Member-facing pages (`/submit`, `/my-assignments`, `/tracking`) require a
per-group passcode: picking a group (or visiting `/submit?group=<id>`
directly) prompts for that group's passcode before showing any of its
members, commitments, or assignments — so one group can't see another's
data. Admins set/regenerate each group's passcode from
Admin → Groups → Manage members. A correct passcode is remembered in a
signed, httpOnly cookie for 90 days; regenerating or changing a group's
passcode immediately signs out anyone using the old one.

## How assignment works

`src/lib/assign.ts` implements the random pairing: given the commitment
cards submitted for a group this week, it builds a "derangement" — a
random pairing where no one is ever assigned their own card, and partners
are distributed as evenly as possible when the number of cards and members
don't match exactly (e.g. someone didn't submit that week). If a group
somehow only has one distinct submitter, that one card is left
self-assigned and flagged in the admin UI, since no partner is possible.

Re-running the assignment for a group is only allowed before any call or
prayer has been logged for that week, so admins can safely re-shuffle a
mistake without wiping out tracked progress.

## WhatsApp sharing

Two "Share to WhatsApp" buttons open `wa.me` with a pre-filled message —
you pick the destination (a group chat, a DM) in WhatsApp itself; nothing
is sent automatically or to a fixed number.

- **Weekly assignment summary** (Admin → the week's page, per group): once
  assignment has been run, shares the full pairing list for that group and
  week.
- **Completion check-in** (`/my-assignments`, per assignment card): appears
  once you've marked called and/or prayed. Shares who it's for, which
  actions are done, and the timestamps. Your call notes are only included
  if you tick "Include call notes in the shared message" — off by default,
  since notes can be personal.

## Data model

See `src/lib/types.ts`:

- **Group** — a small group (e.g. "Group 1"); has a shared `passcode`
  members enter to access its pages
- **Member** — belongs to a group; has a name and phone number;
  deactivating a member hides them from future weeks without deleting
  their history
- **Cycle** — a week; only one is "open" for submissions at a time
- **Commitment** — one member's obedience commitment for one cycle
- **Assignment** — pairs a commitment with the partner responsible for
  calling/praying, plus `calledAt`, `prayedAt`, and free-text `notes`

## Production

```bash
npm run build
ADMIN_PASSWORD=... POSTGRES_URL=... npm run start
```

Deploys to Vercel (or anywhere else that can reach a Postgres database) —
state lives in Postgres rather than on local disk, so it survives restarts,
cold starts, and multiple concurrent instances.
