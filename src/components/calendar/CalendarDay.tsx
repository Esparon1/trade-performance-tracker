import type {
  DisplayMode,
  PerformanceEntry,
} from "../../types/entry";

import {
  calculateDailyTotals,
  getEntryDirection,
} from "../../utils/calendar";

import {
  formatAmount,
  formatPercentage,
} from "../../utils/format";

interface CalendarDayProps {
  day: number;
  date: string;
  entries: PerformanceEntry[];
  displayMode: DisplayMode;
  onClick: (date: string) => void;
}

export default function CalendarDay({
  day,
  date,
  entries,
  displayMode,
  onClick,
}: CalendarDayProps) {
  const hasEntries = entries.length > 0;
  const totals = calculateDailyTotals(entries);
  const direction = getEntryDirection(totals);

  let backgroundClass =
    "border-neutral-800 bg-neutral-900 hover:border-neutral-600";

  if (direction === "positive") {
    backgroundClass =
      "border-green-500/40 bg-green-500/10 hover:border-green-400/70";
  }

  if (direction === "negative") {
    backgroundClass =
      "border-red-500/40 bg-red-500/10 hover:border-red-400/70";
  }

  return (
    <button
      type="button"
      onClick={() => onClick(date)}
      className={`group relative min-h-28 rounded-xl border p-3 text-left transition ${backgroundClass}`}
      aria-label={`Open entries for ${date}`}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm text-neutral-400">
          {day}
        </span>

        {entries.length > 1 && (
          <span className="rounded-full bg-black/40 px-2 py-0.5 text-xs text-neutral-300">
            {entries.length} entries
          </span>
        )}
      </div>

      {hasEntries && (
        <>
          <div className="mt-4 space-y-1">
            {(displayMode === "percentage" ||
              displayMode === "both") && (
              <p
                className={`font-semibold ${
                  totals.percentage >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {formatPercentage(totals.percentage)}
              </p>
            )}

            {(displayMode === "amount" ||
              displayMode === "both") && (
              <p
                className={`${
                  displayMode === "both"
                    ? "text-sm"
                    : "font-semibold"
                } ${
                  totals.amount >= 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {formatAmount(totals.amount)}
              </p>
            )}
          </div>

          <span className="absolute inset-x-2 bottom-2 rounded-md bg-black/90 px-2 py-1 text-center text-xs text-white opacity-0 transition group-hover:opacity-100">
            View details
          </span>
        </>
      )}
    </button>
  );
}