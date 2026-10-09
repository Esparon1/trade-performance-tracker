import type { TradingPerformanceStats } from "./tradingStats";
import KpiCard from "./KpiCard";
import { formatMoney, formatRatio, valueTone } from "./formatters";

export default function TradingPerformanceSection({

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
