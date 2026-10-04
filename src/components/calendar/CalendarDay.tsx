import type {
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

  onClick: (
    date: string,
  ) => void;
}

export default function CalendarDay({
  day,
  date,
  entries,
  onClick,
}: CalendarDayProps) {
  const hasEntries =
    entries.length > 0;

  const totals =
    calculateDailyTotals(
      entries,
    );

  const direction =
    getEntryDirection(
      totals,
    );

  const isPositive =
    direction ===
    "positive";

  const isNegative =
    direction ===
    "negative";

  /*
   * =====================================================
   * CURRENCIES USED THIS DAY
   * =====================================================
   */

  const currencies =
    Array.from(
      new Set(
        entries
          .map(
            (entry) =>
              entry.currency,
          )
          .filter(
            (
              currency,
            ): currency is
              NonNullable<
                typeof currency
              > =>
              currency !== null,
          ),
      ),
    );

  const hasMixedCurrencies =
    currencies.length > 1;

  const dayCurrency =
    currencies.length === 1
      ? currencies[0]
      : null;

  /*
   * =====================================================
   * PERCENTAGE
   * =====================================================
   *
   * Old trades can still contain manually entered
   * percentages.
   *
   * New trades currently have percentage = null until
   * we implement the account-equity return engine.
   */

  const percentageEntries =
    entries.filter(
      (entry) =>
        entry.percentage !==
        null,
    );

  const hasPercentage =
    percentageEntries.length > 0;

  const percentageTotal =
    percentageEntries.reduce(
      (sum, entry) =>
        sum +
        (entry.percentage ??
          0),
      0,
    );

  /*
   * =====================================================
   * APPEARANCE
   * =====================================================
   */

  let backgroundClass =
    "border-white/[0.07] bg-[#141716]/90 hover:border-white/[0.16] hover:bg-[#191c1b]";

  if (isPositive) {
    backgroundClass =
      "border-emerald-500/35 bg-emerald-950/45 hover:border-emerald-400/65";
  }

  if (isNegative) {
    backgroundClass =
      "border-red-500/35 bg-red-950/40 hover:border-red-400/65";
  }

  return (
    <button
      type="button"
      onClick={() =>
        onClick(date)
      }
      className={`
        group
        relative
        min-h-32
        overflow-hidden
        rounded-xl
        border
        p-3
        text-left
        shadow-[0_8px_25px_rgba(0,0,0,0.12)]
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)]
        ${backgroundClass}
      `}
      aria-label={`Open trades for ${date}`}
    >

      {/* POSITIVE GLOW */}

      {isPositive && (
        <>
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-emerald-500/[0.13] blur-3xl transition-opacity duration-300 group-hover:bg-emerald-500/[0.18]" />

          <div className="pointer-events-none absolute left-0 top-0 h-full w-[2px] bg-emerald-400/80" />
        </>
      )}

      {/* NEGATIVE GLOW */}

      {isNegative && (
        <>
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-red-500/[0.13] blur-3xl transition-opacity duration-300 group-hover:bg-red-500/[0.18]" />

          <div className="pointer-events-none absolute left-0 top-0 h-full w-[2px] bg-red-400/80" />
        </>
      )}

      {/* TOP */}

      <div className="relative flex items-start justify-between gap-2">

        <span
          className={`text-sm font-medium ${
            hasEntries
              ? "text-neutral-300"
              : "text-neutral-500"
          }`}
        >
          {day}
        </span>

        {entries.length > 1 && (
          <span className="rounded-full border border-white/[0.06] bg-black/40 px-2 py-0.5 text-[11px] font-medium text-neutral-300 backdrop-blur-sm">
            {entries.length} trades
          </span>
        )}

      </div>

      {/* MAIN P/L */}

      {hasEntries && (
        <div className="relative mt-5">

          {hasMixedCurrencies ? (
            <div>
              <p className="text-sm font-semibold text-amber-300">
                Mixed currencies
              </p>

              <p className="mt-1 text-[10px] text-neutral-500">
                FX conversion required
              </p>
            </div>
          ) : (
            <div>
              <p
                className={`text-lg font-semibold tracking-tight ${
                  totals.amount >=
                  0
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {formatAmount(
                  totals.amount,
                )}
              </p>

              {dayCurrency && (
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-neutral-500">
                  {dayCurrency}
                </p>
              )}
            </div>
          )}

        </div>
      )}

      {/* PERCENTAGE - BOTTOM RIGHT */}

      {hasEntries && (
        <div className="absolute bottom-3 right-3">

          {hasPercentage ? (
            <span
              className={`text-xs font-semibold ${
                percentageTotal >=
                0
                  ? "text-emerald-400/90"
                  : "text-red-400/90"
              }`}
            >
              {formatPercentage(
                percentageTotal,
              )}
            </span>
          ) : (
            <span
              className="text-xs text-neutral-600"
              title="Return calculation will be available after account balance calculations are enabled."
            >
              —
            </span>
          )}

        </div>
      )}

      {/* VIEW DETAILS */}

      {hasEntries && (
        <div className="pointer-events-none absolute inset-x-2 bottom-2 translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">

          <div className="rounded-lg border border-white/[0.08] bg-black/90 px-2 py-1.5 text-center text-[11px] font-medium text-neutral-200 backdrop-blur-md">
            View details
          </div>

        </div>
      )}

    </button>
  );
}