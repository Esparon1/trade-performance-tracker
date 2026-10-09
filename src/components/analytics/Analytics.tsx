import { useMemo, useState } from "react";
import type { Account } from "../../types/account";
import type { CashFlow } from "../../types/cashFlow";
import type { PerformanceEntry } from "../../types/entry";
import { getEquityCurve, getPerformanceKpis, type PerformanceRange } from "../../utils/performance";
import EquityChart from "./EquityChart";
import KpiCard from "./KpiCard";
import MonthlyPerformanceSection from "./MonthlyPerformanceSection";
import TradingPerformanceSection from "./TradingPerformanceSection";
import { getTradingPerformanceStats } from "./tradingStats";
import { formatLocalDate, formatMoney, formatPercentage, valueTone } from "./formatters";

interface AnalyticsProps {
  account: Account;
  entries: PerformanceEntry[];
  cashFlows: CashFlow[];
}

const ranges: PerformanceRange[] = ["1M", "3M", "6M", "YTD", "1Y", "ALL"];

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
