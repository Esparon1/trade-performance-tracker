import {
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  Account,
} from "../../types/account";

import type {
  CashFlow,
} from "../../types/cashFlow";

import type {
  PerformanceEntry,
} from "../../types/entry";

import {
  getEquityCurve,
  getPerformanceKpis,
  getTimeWeightedReturnBetweenDates,
  type EquityCurvePoint,
  type PerformanceRange,
} from "../../utils/performance";

interface AnalyticsProps {
  account: Account;
  entries: PerformanceEntry[];
  cashFlows: CashFlow[];
}

const ranges: PerformanceRange[] = [
  "1M",
  "3M",
  "6M",
  "YTD",
  "1Y",
  "ALL",
];

function formatLocalDate(
  date: Date,
): string {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatMoney(
  value: number | null,
  signed = false,
): string {
  if (value === null) {
    return "—";
  }

  const rounded =
    Math.round(value);
  const absolute =
    Math.abs(
      rounded,
    ).toLocaleString("en-CA");

  if (!signed) {
    return `$${absolute}`;
  }

  if (rounded > 0) {
    return `+$${absolute}`;
  }

  if (rounded < 0) {
    return `-$${absolute}`;
  }

  return "$0";
}

function formatPercentage(
  value: number | null,
): string {
  if (value === null) {
    return "—";
  }

  const normalized =
    Math.abs(value) < 0.05
      ? 0
      : value;

  return `${normalized > 0 ? "+" : ""}${normalized.toFixed(1)}%`;
}

function valueTone(
  value: number | null,
): string {
  if (
    value === null ||
    value === 0
  ) {
    return "text-white";
  }

  return value > 0
    ? "text-emerald-300"
    : "text-red-300";
}

function KpiCard({
  label,
  value,
  detail,
  valueClassName = "text-white",
}: {
  label: string;
  value: string;
  detail: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/30 p-5 backdrop-blur-md">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-semibold tracking-tight sm:text-3xl ${valueClassName}`}
      >
        {value}
      </p>

      <p className="mt-2 text-xs text-neutral-600">
        {detail}
      </p>
    </div>
  );
}

function shortMoney(
  value: number,
): string {
  const absolute =
    Math.abs(value);

  if (absolute >= 1_000_000) {
    return `$${(
      value / 1_000_000
    ).toFixed(1)}M`;
  }

  if (absolute >= 1_000) {
    return `$${(
      value / 1_000
    ).toFixed(0)}k`;
  }

  return `$${Math.round(
    value,
  )}`;
}

function formatChartDate(
  dateString: string,
): string {
  const [
    year,
    month,
    day,
  ] = dateString
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(
    new Date(
      year,
      month - 1,
      day,
    ),
  );
}

type ChartMode =
  | "equity"
  | "pnl";

interface ChartPoint {
  date: string;
  value: number;
  dailyPnl: number;
  cashFlow: number;
}

function getPointX(
  index: number,
  count: number,
  width: number,
  paddingX: number,
): number {
  if (count <= 1) {
    return width / 2;
  }

  return (
    paddingX +
    (index / (count - 1)) *
      (width - paddingX * 2)
  );
}

function getPointY(
  value: number,
  height: number,
  paddingY: number,
  minValue: number,
  maxValue: number,
): number {
  const range =
    maxValue - minValue || 1;

  return (
    paddingY +
    ((maxValue - value) /
      range) *
      (height - paddingY * 2)
  );
}

function EquityChart({
  points,
  currency,
}: {
  points: EquityCurvePoint[];
  currency: string;
}) {
  const width = 1000;
  const height = 320;
  const paddingX = 16;
  const paddingY = 24;

  const [
    mode,
    setMode,
  ] = useState<ChartMode>(
    "equity",
  );

  const [
    activeIndex,
    setActiveIndex,
  ] = useState<
    number | null
  >(null);

  const chartRef =
    useRef<HTMLDivElement>(
      null,
    );

  const chartPoints =
    useMemo<ChartPoint[]>(
      () => {
        let cumulativePnl = 0;

        return points.map(
          (point) => {
            cumulativePnl +=
              point.pnl;

            return {
              date: point.date,
              value:
                mode ===
                "equity"
                  ? point.equity
                  : cumulativePnl,
              dailyPnl:
                point.pnl,
              cashFlow:
                point.cashFlow,
            };
          },
        );
      },
      [points, mode],
    );

  if (
    chartPoints.length === 0
  ) {
    return (
      <div className="mt-6 rounded-2xl border border-white/[0.07] bg-black/30 backdrop-blur-md">
        <div className="flex h-72 items-center justify-center text-sm text-neutral-600">
          No chart data is
          available for this
          period.
        </div>
      </div>
    );
  }

  const values =
    chartPoints.map(
      (point) => point.value,
    );

  const actualMin =
    Math.min(...values);
  const actualMax =
    Math.max(...values);

  const spread =
    actualMax - actualMin;

  const visualPadding =
    spread > 0
      ? spread * 0.12
      : Math.max(
          Math.abs(
            actualMax,
          ) * 0.05,
          100,
        );

  const minValue =
    actualMin - visualPadding;
  const maxValue =
    actualMax + visualPadding;

  const path =
    chartPoints
      .map(
        (point, index) => {
          const x = getPointX(
            index,
            chartPoints.length,
            width,
            paddingX,
          );

          const y = getPointY(
            point.value,
            height,
            paddingY,
            minValue,
            maxValue,
          );

          return `${
            index === 0
              ? "M"
              : "L"
          } ${x.toFixed(
            2,
          )} ${y.toFixed(
            2,
          )}`;
        },
      )
      .join(" ");

  const areaPath =
    `${path} L ${
      width - paddingX
    } ${height} L ${paddingX} ${height} Z`;

  const firstPoint =
    chartPoints[0];

  const lastPoint =
    chartPoints[
      chartPoints.length - 1
    ];

  const chartChange =
    lastPoint.value -
    firstPoint.value;

  const gridValues =
    Array.from(
      { length: 5 },
      (_, index) =>
        maxValue -
        ((maxValue -
          minValue) /
          4) *
          index,
    );

  const dateIndexes =
    Array.from(
      new Set(
        [
          0,
          0.25,
          0.5,
          0.75,
          1,
        ].map(
          (ratio) =>
            Math.round(
              (chartPoints.length -
                1) *
                ratio,
            ),
        ),
      ),
    );

  const selectedPoint =
    activeIndex === null
      ? null
      : chartPoints[
          activeIndex
        ];

  const selectedX =
    activeIndex === null
      ? null
      : getPointX(
          activeIndex,
          chartPoints.length,
          width,
          paddingX,
        );

  const selectedY =
    selectedPoint === null
      ? null
      : getPointY(
          selectedPoint.value,
          height,
          paddingY,
          minValue,
          maxValue,
        );

  const handlePointerPosition = (
    clientX: number,
  ) => {
    const element =
      chartRef.current;

    if (!element) {
      return;
    }

    const rect =
      element.getBoundingClientRect();

    if (rect.width <= 0) {
      return;
    }

    const ratio =
      Math.min(
        1,
        Math.max(
          0,
          (clientX -
            rect.left) /
            rect.width,
        ),
      );

    const index =
      Math.round(
        ratio *
          (chartPoints.length -
            1),
      );

    setActiveIndex(index);
  };

  const headlineValue =
    mode === "equity"
      ? lastPoint.value
      : lastPoint.value;

  const headlineDetail =
    mode === "equity"
      ? `Equity change ${formatMoney(
          chartChange,
          true,
        )}`
      : "Cumulative realized P/L";

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-black/30 backdrop-blur-md">
      <div className="flex flex-col gap-5 border-b border-white/[0.06] px-5 py-5 lg:flex-row lg:items-start lg:justify-between sm:px-6">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              {mode ===
              "equity"
                ? "Equity Curve"
                : "Cumulative P/L"}
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              {mode ===
              "equity"
                ? "Tracked account value over the selected period."
                : "Cumulative realized trading profit over the selected period."}
            </p>
          </div>

          <div className="flex w-fit rounded-xl border border-white/[0.07] bg-black/40 p-1">
            <button
              type="button"
              onClick={() => {
                setMode(
                  "equity",
                );
                setActiveIndex(
                  null,
                );
              }}
              className={`rounded-lg px-3.5 py-2 text-xs font-medium transition ${
                mode ===
                "equity"
                  ? "bg-white/[0.09] text-white"
                  : "text-neutral-500 hover:text-neutral-200"
              }`}
            >
              Equity
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("pnl");
                setActiveIndex(
                  null,
                );
              }}
              className={`rounded-lg px-3.5 py-2 text-xs font-medium transition ${
                mode === "pnl"
                  ? "bg-white/[0.09] text-white"
                  : "text-neutral-500 hover:text-neutral-200"
              }`}
            >
              Cumulative P/L
            </button>
          </div>
        </div>

        <div className="lg:text-right">
          <p
            className={`text-2xl font-semibold tracking-tight ${
              mode === "pnl"
                ? valueTone(
                    headlineValue,
                  )
                : "text-white"
            }`}
          >
            {formatMoney(
              headlineValue,
              mode === "pnl",
            )}
          </p>

          <p
            className={`mt-1 text-xs font-medium ${
              mode === "equity"
                ? valueTone(
                    chartChange,
                  )
                : valueTone(
                    headlineValue,
                  )
            }`}
          >
            {headlineDetail}
          </p>
        </div>
      </div>

      <div className="px-4 pb-5 pt-6 sm:px-6">
        <div className="flex gap-3">
          <div className="flex h-[320px] w-14 shrink-0 flex-col justify-between py-5 text-right text-[11px] text-neutral-600">
            {gridValues.map(
              (value) => (
                <span
                  key={value}
                >
                  {shortMoney(
                    value,
                  )}
                </span>
              ),
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div
              ref={chartRef}
              className="relative h-[320px] touch-pan-y overflow-hidden rounded-lg"
              onPointerMove={(
                event,
              ) =>
                handlePointerPosition(
                  event.clientX,
                )
              }
              onPointerDown={(
                event,
              ) =>
                handlePointerPosition(
                  event.clientX,
                )
              }
              onPointerLeave={(
                event,
              ) => {
                if (
                  event.pointerType ===
                  "mouse"
                ) {
                  setActiveIndex(
                    null,
                  );
                }
              }}
            >
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-between py-6">
                {gridValues.map(
                  (value) => (
                    <div
                      key={value}
                      className="border-t border-white/[0.055]"
                    />
                  ),
                )}
              </div>

              <svg
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                role="img"
                aria-label={`${
                  mode === "equity"
                    ? "Equity"
                    : "Cumulative realized profit and loss"
                } curve in ${currency}`}
              >
                <defs>
                  <linearGradient
                    id={`analytics-area-${mode}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="rgb(52 211 153)"
                      stopOpacity="0.18"
                    />
                    <stop
                      offset="100%"
                      stopColor="rgb(52 211 153)"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                <path
                  d={areaPath}
                  fill={`url(#analytics-area-${mode})`}
                />

                <path
                  d={path}
                  fill="none"
                  stroke="rgb(110 231 183)"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {selectedX !==
                  null && (
                  <>
                    <line
                      x1={
                        selectedX
                      }
                      x2={
                        selectedX
                      }
                      y1="0"
                      y2={
                        height
                      }
                      stroke="rgb(163 163 163)"
                      strokeOpacity="0.35"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                      strokeDasharray="4 5"
                    />

                    {selectedY !==
                      null && (
                      <circle
                        cx={
                          selectedX
                        }
                        cy={
                          selectedY
                        }
                        r="5"
                        fill="rgb(110 231 183)"
                        stroke="rgb(10 10 10)"
                        strokeWidth="3"
                        vectorEffect="non-scaling-stroke"
                      />
                    )}
                  </>
                )}
              </svg>

              {selectedPoint &&
                selectedX !==
                  null && (
                  <div
                    className={`pointer-events-none absolute top-3 z-10 w-52 rounded-xl border border-white/[0.1] bg-neutral-950/95 p-3 shadow-xl backdrop-blur-md ${
                      selectedX >
                      width / 2
                        ? "right-3"
                        : "left-3"
                    }`}
                  >
                    <p className="text-xs font-semibold text-neutral-300">
                      {formatChartDate(
                        selectedPoint.date,
                      )}
                    </p>

                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-neutral-500">
                          {mode ===
                          "equity"
                            ? "Equity"
                            : "Cumulative P/L"}
                        </span>

                        <span
                          className={`text-xs font-semibold ${
                            mode ===
                            "pnl"
                              ? valueTone(
                                  selectedPoint.value,
                                )
                              : "text-white"
                          }`}
                        >
                          {formatMoney(
                            selectedPoint.value,
                            mode ===
                              "pnl",
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-neutral-500">
                          Daily P/L
                        </span>

                        <span
                          className={`text-xs font-semibold ${valueTone(
                            selectedPoint.dailyPnl,
                          )}`}
                        >
                          {formatMoney(
                            selectedPoint.dailyPnl,
                            true,
                          )}
                        </span>
                      </div>

                      {mode ===
                        "equity" && (
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs text-neutral-500">
                            Cash Flow
                          </span>

                          <span
                            className={`text-xs font-semibold ${valueTone(
                              selectedPoint.cashFlow,
                            )}`}
                          >
                            {formatMoney(
                              selectedPoint.cashFlow,
                              true,
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>

            <div className="mt-3 flex justify-between gap-2 text-[11px] text-neutral-600">
              {dateIndexes.map(
                (index) => (
                  <span
                    key={`${chartPoints[index].date}-${index}`}
                    className="whitespace-nowrap"
                  >
                    {formatChartDate(
                      chartPoints[
                        index
                      ].date,
                    )}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-neutral-700">
          Hover the chart for
          exact values. On touch
          devices, tap or drag
          across the chart.
        </p>
      </div>
    </div>
  );
}


interface TradingPerformanceStats {
  totalTrades: number;
  wins: number;
  losses: number;
  breakeven: number;
  winRate: number | null;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number | null;
  averageWin: number | null;
  averageLoss: number | null;
  expectancy: number | null;
}

interface MonthlyPerformance {
  monthIndex: number;
  label: string;
  returnPercentage: number | null;
  pnl: number;
  hasData: boolean;
}

function isDateInRange(
  date: string,
  startDate: string | null,
  endDate: string,
): boolean {
  return (
    (startDate === null ||
      date >= startDate) &&
    date <= endDate
  );
}

function getTradingPerformanceStats(
  entries: PerformanceEntry[],
  startDate: string | null,
  endDate: string,
): TradingPerformanceStats {
  const trades = entries.filter(
    (entry) =>
      entry.amount !== null &&
      Number.isFinite(entry.amount) &&
      isDateInRange(
        entry.date,
        startDate,
        endDate,
      ),
  );

  const wins = trades.filter(
    (entry) =>
      (entry.amount ?? 0) > 0,
  );

  const losses = trades.filter(
    (entry) =>
      (entry.amount ?? 0) < 0,
  );

  const breakeven =
    trades.length -
    wins.length -
    losses.length;

  const grossProfit = wins.reduce(
    (sum, entry) =>
      sum + (entry.amount ?? 0),
    0,
  );

  const grossLoss = losses.reduce(
    (sum, entry) =>
      sum + (entry.amount ?? 0),
    0,
  );

  const totalPnl = trades.reduce(
    (sum, entry) =>
      sum + (entry.amount ?? 0),
    0,
  );

  return {
    totalTrades: trades.length,
    wins: wins.length,
    losses: losses.length,
    breakeven,
    winRate:
      trades.length > 0
        ? (wins.length /
            trades.length) *
          100
        : null,
    grossProfit,
    grossLoss,
    profitFactor:
      grossLoss < 0
        ? grossProfit /
          Math.abs(grossLoss)
        : null,
    averageWin:
      wins.length > 0
        ? grossProfit /
          wins.length
        : null,
    averageLoss:
      losses.length > 0
        ? grossLoss /
          losses.length
        : null,
    expectancy:
      trades.length > 0
        ? totalPnl /
          trades.length
        : null,
  };
}

function formatRatio(
  value: number | null,
): string {
  if (value === null) {
    return "—";
  }

  return value.toFixed(2);
}

function TradingPerformanceSection({
  stats,
  rangeLabel,
}: {
  stats: TradingPerformanceStats;
  rangeLabel: string;
}) {
  return (
    <div className="mt-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
          Trading Performance
        </p>

        <p className="mt-2 text-sm text-neutral-500">
          Per-trade statistics for{" "}
          {rangeLabel.toLowerCase()}.
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard
          label="Win Rate"
          value={
            stats.winRate === null
              ? "—"
              : `${stats.winRate.toFixed(
                  1,
                )}%`
          }
          detail={`${stats.wins} wins · ${stats.losses} losses${
            stats.breakeven > 0
              ? ` · ${stats.breakeven} breakeven`
              : ""
          }`}
          valueClassName={
            stats.winRate === null
              ? "text-white"
              : stats.winRate >= 50
                ? "text-emerald-300"
                : "text-red-300"
          }
        />

        <KpiCard
          label="Profit Factor"
          value={formatRatio(
            stats.profitFactor,
          )}
          detail="Gross profit ÷ gross loss"
          valueClassName={
            stats.profitFactor ===
            null
              ? "text-white"
              : stats.profitFactor >=
                  1
                ? "text-emerald-300"
                : "text-red-300"
          }
        />

        <KpiCard
          label="Total Trades"
          value={String(
            stats.totalTrades,
          )}
          detail={`${rangeLabel} realized trades`}
        />

        <KpiCard
          label="Avg Win"
          value={formatMoney(
            stats.averageWin,
            true,
          )}
          detail={
            stats.wins > 0
              ? `Across ${stats.wins} winning trades`
              : "No winning trades"
          }
          valueClassName={
            stats.averageWin ===
            null
              ? "text-white"
              : "text-emerald-300"
          }
        />

        <KpiCard
          label="Avg Loss"
          value={formatMoney(
            stats.averageLoss,
            true,
          )}
          detail={
            stats.losses > 0
              ? `Across ${stats.losses} losing trades`
              : "No losing trades"
          }
          valueClassName={
            stats.averageLoss ===
            null
              ? "text-white"
              : "text-red-300"
          }
        />

        <KpiCard
          label="Expectancy"
          value={formatMoney(
            stats.expectancy,
            true,
          )}
          detail="Average realized P/L per trade"
          valueClassName={valueTone(
            stats.expectancy,
          )}
        />
      </div>
    </div>
  );
}

function getMonthBounds(
  year: number,
  monthIndex: number,
): {
  start: string;
  end: string;
} {
  const month = String(
    monthIndex + 1,
  ).padStart(2, "0");

  const lastDay = new Date(
    year,
    monthIndex + 1,
    0,
  ).getDate();

  return {
    start: `${year}-${month}-01`,
    end: `${year}-${month}-${String(
      lastDay,
    ).padStart(2, "0")}`,
  };
}

function MonthlyPerformanceSection({
  account,
  entries,
  cashFlows,
  today,
}: {
  account: Account;
  entries: PerformanceEntry[];
  cashFlows: CashFlow[];
  today: string;
}) {
  const currentYear = Number(
    today.slice(0, 4),
  );

  const [
    year,
    setYear,
  ] = useState(currentYear);

  const startingYear =
    account.startingDate
      ? Number(
          account.startingDate.slice(
            0,
            4,
          ),
        )
      : currentYear;

  const months =
    useMemo<MonthlyPerformance[]>(
      () =>
        Array.from(
          { length: 12 },
          (_, monthIndex) => {
            const bounds =
              getMonthBounds(
                year,
                monthIndex,
              );

            const effectiveStart =
              account.startingDate &&
              account.startingDate >
                bounds.start
                ? account.startingDate
                : bounds.start;

            const effectiveEnd =
              bounds.end > today
                ? today
                : bounds.end;

            const isBeforeAccount =
              account.startingDate !==
                null &&
              bounds.end <
                account.startingDate;

            const isFuture =
              bounds.start > today;

            const monthEntries =
              entries.filter(
                (entry) =>
                  entry.amount !==
                    null &&
                  entry.date >=
                    effectiveStart &&
                  entry.date <=
                    effectiveEnd,
              );

            const monthFlows =
              cashFlows.filter(
                (flow) =>
                  flow.date >=
                    effectiveStart &&
                  flow.date <=
                    effectiveEnd,
              );

            const pnl =
              monthEntries.reduce(
                (sum, entry) =>
                  sum +
                  (entry.amount ?? 0),
                0,
              );

            const hasData =
              !isBeforeAccount &&
              !isFuture &&
              (monthEntries.length >
                0 ||
                monthFlows.length >
                  0);

            const returnPercentage =
              !hasData ||
              effectiveStart >
                effectiveEnd
                ? null
                : getPerformanceKpis(
                    account,
                    entries,
                    cashFlows,
                    "ALL",
                    effectiveEnd,
                  ).startDate ===
                  null
                  ? null
                  : getTimeWeightedReturnBetweenDates(
                      account,
                      entries,
                      cashFlows,
                      effectiveStart,
                      effectiveEnd,
                    );

            return {
              monthIndex,
              label:
                new Intl.DateTimeFormat(
                  "en-CA",
                  {
                    month: "short",
                  },
                ).format(
                  new Date(
                    year,
                    monthIndex,
                    1,
                  ),
                ),
              returnPercentage,
              pnl,
              hasData,
            };
          },
        ),
      [
        account,
        entries,
        cashFlows,
        today,
        year,
      ],
    );

  return (
    <div className="mt-8 rounded-2xl border border-white/[0.07] bg-black/30 p-5 backdrop-blur-md sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
            Monthly Performance
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            Cash-flow-aware monthly
            returns and realized P/L.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setYear(
                (value) =>
                  value - 1,
              )
            }
            disabled={
              year <= startingYear
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-neutral-400 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Previous year"
          >
            ←
          </button>

          <div className="min-w-20 text-center text-sm font-semibold text-white">
            {year}
          </div>

          <button
            type="button"
            onClick={() =>
              setYear(
                (value) =>
                  value + 1,
              )
            }
            disabled={
              year >= currentYear
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-neutral-400 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Next year"
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {months.map(
          (month) => {
            const positive =
              month.returnPercentage !==
                null &&
              month.returnPercentage >
                0;

            const negative =
              month.returnPercentage !==
                null &&
              month.returnPercentage <
                0;

            return (
              <div
                key={
                  month.monthIndex
                }
                className={`rounded-xl border p-4 ${
                  positive
                    ? "border-emerald-400/15 bg-emerald-400/[0.035]"
                    : negative
                      ? "border-red-400/15 bg-red-400/[0.035]"
                      : "border-white/[0.06] bg-white/[0.02]"
                }`}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                  {month.label}
                </p>

                <p
                  className={`mt-3 text-xl font-semibold ${
                    month.hasData
                      ? valueTone(
                          month.returnPercentage,
                        )
                      : "text-neutral-700"
                  }`}
                >
                  {month.hasData
                    ? formatPercentage(
                        month.returnPercentage,
                      )
                    : "—"}
                </p>

                <p
                  className={`mt-1 text-xs font-medium ${
                    month.hasData
                      ? valueTone(
                          month.pnl,
                        )
                      : "text-neutral-700"
                  }`}
                >
                  {month.hasData
                    ? `${formatMoney(
                        month.pnl,
                        true,
                      )} realized P/L`
                    : "No activity"}
                </p>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}

function Analytics({
  account,
  entries,
  cashFlows,
}: AnalyticsProps) {
  const [
    range,
    setRange,
  ] =
    useState<PerformanceRange>(
      "ALL",
    );

  const endDate =
    formatLocalDate(
      new Date(),
    );

  const kpis =
    useMemo(
      () =>
        getPerformanceKpis(
          account,
          entries,
          cashFlows,
          range,
          endDate,
        ),
      [
        account,
        entries,
        cashFlows,
        range,
        endDate,
      ],
    );

  const equityCurve =
    useMemo(() => {
      if (
        kpis.startDate ===
        null
      ) {
        return [];
      }

      return getEquityCurve(
        account,
        entries,
        cashFlows,
        kpis.startDate,
        endDate,
      );
    }, [
      account,
      entries,
      cashFlows,
      kpis.startDate,
      endDate,
    ]);

  const tradingStats =
    useMemo(
      () =>
        getTradingPerformanceStats(
          entries,
          kpis.startDate,
          endDate,
        ),
      [
        entries,
        kpis.startDate,
        endDate,
      ],
    );

  const rangeLabel =
    range === "ALL"
      ? "All time"
      : range;

  return (
    <section>
      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400/80">
            Performance Analytics
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Analytics
          </h2>

          <p className="mt-2 text-sm text-neutral-500">
            Performance for{" "}
            <span className="font-medium text-neutral-300">
              {account.name}
            </span>
            .
          </p>
        </div>

        <div className="flex w-fit flex-wrap rounded-xl border border-white/[0.07] bg-black/30 p-1 backdrop-blur-md">
          {ranges.map(
            (option) => (
              <button
                key={option}
                type="button"
                onClick={() =>
                  setRange(option)
                }
                className={`rounded-lg px-3 py-2 text-xs font-medium transition sm:px-4 ${
                  range === option
                    ? "bg-white/[0.09] text-white"
                    : "text-neutral-500 hover:text-neutral-200"
                }`}
              >
                {option}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Current Equity"
          value={formatMoney(
            kpis.currentEquity,
          )}
          detail={
            kpis.currentEquity ===
            null
              ? "Starting capital required"
              : account.defaultCurrency
          }
        />

        <KpiCard
          label="Total P/L"
          value={formatMoney(
            kpis.totalPnl,
            true,
          )}
          detail={`${rangeLabel} trading P/L`}
          valueClassName={valueTone(
            kpis.totalPnl,
          )}
        />

        <KpiCard
          label="Return"
          value={formatPercentage(
            kpis.returnPercentage,
          )}
          detail={`${rangeLabel} time-weighted return`}
          valueClassName={valueTone(
            kpis.returnPercentage,
          )}
        />

        <KpiCard
          label="Max Drawdown"
          value={formatPercentage(
            kpis.maxDrawdownPercentage,
          )}
          detail={`${rangeLabel} cash-flow neutral`}
          valueClassName={
            kpis.maxDrawdownPercentage !==
              null &&
            kpis.maxDrawdownPercentage <
              0
              ? "text-red-300"
              : "text-white"
          }
        />
      </div>

      <EquityChart
        points={equityCurve}
        currency={
          account.defaultCurrency
        }
      />

      <TradingPerformanceSection
        stats={tradingStats}
        rangeLabel={rangeLabel}
      />

      <MonthlyPerformanceSection
        account={account}
        entries={entries}
        cashFlows={cashFlows}
        today={endDate}
      />
    </section>
  );
}

export default Analytics;
