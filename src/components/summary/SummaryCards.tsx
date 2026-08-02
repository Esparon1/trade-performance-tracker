import type { PerformanceEntry } from "../../types/entry";

import {
  calculateDailyTotals,
  getEntryDirection,
} from "../../utils/calendar";

import {
  formatAmount,
  formatPercentage,
} from "../../utils/format";

interface SummaryCardsProps {
  entries: PerformanceEntry[];
  year: number;
  month: number;
}

export default function SummaryCards({
  entries,
  year,
  month,
}: SummaryCardsProps) {
  const selectedMonth = String(month + 1).padStart(2, "0");
  const monthPrefix = `${year}-${selectedMonth}`;

  const monthEntries = entries.filter((entry) =>
    entry.date.startsWith(monthPrefix),
  );

  const monthlyTotals =
    calculateDailyTotals(monthEntries);

  const entriesGroupedByDate = new Map<
    string,
    PerformanceEntry[]
  >();

  monthEntries.forEach((entry) => {
    const currentEntries =
      entriesGroupedByDate.get(entry.date) ?? [];

    entriesGroupedByDate.set(entry.date, [
      ...currentEntries,
      entry,
    ]);
  });

  let winningDays = 0;
  let losingDays = 0;

  entriesGroupedByDate.forEach((dayEntries) => {
    const totals = calculateDailyTotals(dayEntries);
    const direction = getEntryDirection(totals);

    if (direction === "positive") {
      winningDays += 1;
    }

    if (direction === "negative") {
      losingDays += 1;
    }
  });

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
        <p className="text-sm text-neutral-400">
          Monthly P/L
        </p>

        <h2
          className={`mt-2 text-2xl font-semibold ${
            monthlyTotals.amount >= 0
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          {formatAmount(monthlyTotals.amount)}
        </h2>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
        <p className="text-sm text-neutral-400">
          Total entered percentage
        </p>

        <h2
          className={`mt-2 text-2xl font-semibold ${
            monthlyTotals.percentage >= 0
              ? "text-green-400"
              : "text-red-400"
          }`}
        >
          {formatPercentage(monthlyTotals.percentage)}
        </h2>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
        <p className="text-sm text-neutral-400">
          Winning days
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-green-400">
          {winningDays}
        </h2>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
        <p className="text-sm text-neutral-400">
          Losing days
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-red-400">
          {losingDays}
        </h2>
      </div>
    </section>
  );
}