import Analytics from "../analytics/Analytics";
import Calendar from "../calendar/Calendar";
import CalendarHeader from "../calendar/CalendarHeader";
import SummaryCards from "../summary/SummaryCards";
import type { Account } from "../../types/account";
import type { CashFlow } from "../../types/cashFlow";
import type { PerformanceEntry } from "../../types/entry";
import type { DashboardView } from "./DashboardViewSwitch";

interface DashboardAccountContentProps {
  selectedAccount: Account | null;
  dashboardView: DashboardView;
  accountEntries: PerformanceEntry[];
  accountCashFlows: CashFlow[];
  cashFlowsLoading: boolean;
  entriesLoading: boolean;
  settingsLoading: boolean;
  month: number;
  year: number;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onDayClick: (date: string) => void;
  onOpenSettings: () => void;
}

export default function DashboardAccountContent({
  selectedAccount, dashboardView, accountEntries, accountCashFlows,
  cashFlowsLoading, entriesLoading, settingsLoading, month, year,
  onPreviousMonth: handlePreviousMonth, onNextMonth: handleNextMonth,
  onMonthChange: setMonth, onYearChange: setYear,
  onDayClick: setSelectedDate, onOpenSettings: openSettings,
}: DashboardAccountContentProps) {
  return (
    <>
        {/* ACCOUNT CONTENT */}

        {selectedAccount ? (

          dashboardView === "calendar" ? (

            <>

              {cashFlowsLoading ? (

                <div className="mb-4 rounded-xl border border-white/[0.07] bg-black/20 px-4 py-3 text-sm text-neutral-500 backdrop-blur-sm">

                  Loading account cash flow...

                </div>

              ) : (

                <SummaryCards

                  entries={accountEntries}

                  cashFlows={accountCashFlows}

                  account={selectedAccount}

                  month={month}

                  year={year}

                />

              )}

              <CalendarHeader

                month={month}

                year={year}

                onPreviousMonth={handlePreviousMonth}

                onNextMonth={handleNextMonth}

                onMonthChange={setMonth}

                onYearChange={setYear}

              />

              {entriesLoading || cashFlowsLoading ? (

                <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-10 text-center text-neutral-400 backdrop-blur-sm">

                  Loading your account performance...

                </div>

              ) : (

                <Calendar

                  year={year}

                  month={month}

                  entries={accountEntries}

                  cashFlows={accountCashFlows}

                  account={selectedAccount}

                  onDayClick={setSelectedDate}

                />

              )}

            </>

          ) : (

            <Analytics

              account={selectedAccount}

              entries={accountEntries}

              cashFlows={accountCashFlows}

            />

          )

        ) : (

          !settingsLoading && (

            <div className="rounded-2xl border border-white/[0.07] bg-black/30 p-10 text-center backdrop-blur-md">

              <h2 className="text-lg font-medium text-white">

                No account selected

              </h2>

              <p className="mt-2 text-sm text-neutral-500">

                Create an account in Settings to start tracking performance.

              </p>

              <button

                type="button"

                onClick={openSettings}

                className="mt-5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-5 py-2.5 text-sm font-medium text-emerald-300 transition hover:border-emerald-400/45"

              >

                Open Settings

              </button>

            </div>

          )

        )}

    </>
  );
}
