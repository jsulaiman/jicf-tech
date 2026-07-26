export interface WeeklyStats {
  totalActive: number;
  submitted: number;
  assigned: number;
  called: number;
  prayed: number;
}

export function buildGroupSummaryText(
  groupName: string,
  cycleLabel: string,
  stats: WeeklyStats,
  pendingCalls: string[]
): string {
  const lines = [
    `📊 *${groupName}* — ${cycleLabel}`,
    `Submitted: ${stats.submitted}/${stats.totalActive}`,
    `Assigned: ${stats.assigned}/${stats.submitted}`,
    `Called: ${stats.called}/${stats.assigned}`,
    `Prayed: ${stats.prayed}/${stats.assigned}`,
  ];
  if (pendingCalls.length > 0) {
    lines.push("", `Still need a call: ${pendingCalls.join(", ")}`);
  }
  return lines.join("\n");
}

export function buildMinistrySummaryText(
  cycleLabel: string,
  totals: WeeklyStats,
  perGroup: (WeeklyStats & { groupName: string })[]
): string {
  const lines = [
    `📊 *JICF Men's Fellowship* — ${cycleLabel}`,
    `Ministry-wide progress:`,
    `Submitted: ${totals.submitted}/${totals.totalActive}`,
    `Assigned: ${totals.assigned}/${totals.submitted}`,
    `Called: ${totals.called}/${totals.assigned}`,
    `Prayed: ${totals.prayed}/${totals.assigned}`,
    "",
    "By group:",
    ...perGroup.map(
      (g) => `• ${g.groupName}: ${g.called}/${g.assigned} called, ${g.prayed}/${g.assigned} prayed`
    ),
  ];
  return lines.join("\n");
}
