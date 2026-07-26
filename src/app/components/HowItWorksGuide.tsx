import Link from "next/link";

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="m18 4 3 3-3 3" />
      <path d="M2 15h4a5 5 0 0 0 4-2l.35-.5" />
      <path d="M2 6h4a5 5 0 0 1 4 2l4 6a5 5 0 0 0 4 2h3" />
      <path d="m18 20 3-3-3-3" />
      <path d="M2 6h1.4" />
    </svg>
  );
}

function PhoneHeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}

const STEPS = [
  {
    icon: PencilIcon,
    color: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40",
    title: "Submit",
    description:
      "Every member writes down one specific act of obedience to God he's committing to this week.",
    href: "/submit",
    cta: "Submit yours",
  },
  {
    icon: ShuffleIcon,
    color: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/40",
    title: "Random assignment",
    description:
      "An admin runs a random draw: each commitment is handed to a different member of the same group.",
  },
  {
    icon: PhoneHeartIcon,
    color: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/40",
    title: "Call & pray",
    description:
      "Your assigned partner calls you, prays for your commitment, and marks it done once they have.",
    href: "/my-assignments",
    cta: "My Assignments",
  },
  {
    icon: ChartIcon,
    color: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40",
    title: "Track progress",
    description:
      "Everyone can watch submitted / assigned / called / prayed status for the group, all week.",
    href: "/tracking",
    cta: "View Tracking",
  },
];

export default function HowItWorksGuide() {
  return (
    <section>
      <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
        How it works, each week
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="relative rounded-xl border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-900 flex flex-col"
            >
              <span className="absolute top-3 right-3 text-xs font-semibold text-slate-300 dark:text-slate-700">
                {i + 1}
              </span>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${step.color}`}>
                <Icon />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 flex-1">
                {step.description}
              </p>
              {step.href && (
                <Link
                  href={step.href}
                  className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400 underline"
                >
                  {step.cta} &rarr;
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
