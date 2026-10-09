import { useMemo, useState } from "react";
import type { Account } from "../../types/account";
import type { CashFlow } from "../../types/cashFlow";
import type { PerformanceEntry } from "../../types/entry";
import { getPerformanceKpis, getTimeWeightedReturnBetweenDates } from "../../utils/performance";
import { formatMoney, formatPercentage, valueTone } from "./formatters";

interface MonthlyPerformance {

  monthIndex: number;

  label: string;

  returnPercentage: number | null;

  pnl: number;

  hasData: boolean;

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



export default function MonthlyPerformanceSection({

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
