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
  const selectedMonth = String(month + 1).padStart(
    2,
    "0",
  );

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
    const totals =
      calculateDailyTotals(dayEntries);

    const direction =
      getEntryDirection(totals);

    if (direction === "positive") {
      winningDays += 1;
    }

    if (direction === "negative") {
      losingDays += 1;
    }
  });

  const amountPositive =
    monthlyTotals.amount >= 0;

  const percentagePositive =
    monthlyTotals.percentage >= 0;

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

      {/* ============================================= */}
      {/* MONTHLY P/L                                   */}
      {/* ============================================= */}

      <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101312]/90 p-5 shadow-[0_16px_45px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/25">

        <div
          className={`absolute left-0 top-0 h-full w-[2px] ${
            amountPositive
              ? "bg-emerald-400"
              : "bg-red-400"
          }`}
        />

        <div
          className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl ${
            amountPositive
              ? "bg-emerald-500/[0.10]"
              : "bg-red-500/[0.10]"
          }`}
        />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-400">
              Monthly P/L
            </p>

            <h2
              className={`mt-3 text-3xl font-semibold tracking-tight ${
                amountPositive
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {formatAmount(monthlyTotals.amount)}
            </h2>
          </div>

          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              amountPositive
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 17l5-5 4 4 7-8"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 8h5v5"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ============================================= */}
      {/* TOTAL PERCENTAGE                              */}
      {/* ============================================= */}

      <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101312]/90 p-5 shadow-[0_16px_45px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/25">

        <div
          className={`absolute left-0 top-0 h-full w-[2px] ${
            percentagePositive
              ? "bg-emerald-400"
              : "bg-red-400"
          }`}
        />

        <div
          className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl ${
            percentagePositive
              ? "bg-emerald-500/[0.08]"
              : "bg-red-500/[0.08]"
          }`}
        />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-400">
              Total Percentage
            </p>

            <h2
              className={`mt-3 text-3xl font-semibold tracking-tight ${
                percentagePositive
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {formatPercentage(
                monthlyTotals.percentage,
              )}
            </h2>
          </div>

          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              percentagePositive
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                d="M7 17L17 7"
              />
              <circle
                cx="7"
                cy="7"
                r="2"
              />
              <circle
                cx="17"
                cy="17"
                r="2"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ============================================= */}
      {/* WINNING DAYS                                  */}
      {/* ============================================= */}

      <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101312]/90 p-5 shadow-[0_16px_45px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30">

        <div className="absolute left-0 top-0 h-full w-[2px] bg-emerald-400" />

        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/[0.10] blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-400">
              Winning Days
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-emerald-400">
              {winningDays}
            </h2>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 15l4-4 3 3 7-7"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 7h4v4"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ============================================= */}
      {/* LOSING DAYS                                   */}
      {/* ============================================= */}

      <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101312]/90 p-5 shadow-[0_16px_45px_rgba(0,0,0,0.25)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-red-500/30">

        <div className="absolute left-0 top-0 h-full w-[2px] bg-red-400" />

        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500/[0.10] blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-neutral-400">
              Losing Days
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-red-400">
              {losingDays}
            </h2>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 9l4 4 3-3 7 7"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h4v-4"
              />
            </svg>
          </div>
        </div>
      </div>

    </section>
  );
}