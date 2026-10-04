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
  getCalendarDays,
} from "../../utils/calendar";

import {
  getDailyPerformance,
} from "../../utils/performance";

import CalendarDay from "./CalendarDay";

interface CalendarProps {
  year: number;

  month: number;

  entries: PerformanceEntry[];

  cashFlows: CashFlow[];

  account: Account;

  onDayClick: (
    date: string,
  ) => void;
}

const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function Calendar({
  year,
  month,
  entries,
  cashFlows,
  account,
  onDayClick,
}: CalendarProps) {
  const calendarDays =
    getCalendarDays(
      year,
      month,
    );

  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-black/15 p-3 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:p-4">

      {/* WEEK DAYS */}

      <div className="mb-2 grid grid-cols-7 gap-2">

        {weekdays.map(
          (weekday) => (
            <div
              key={weekday}
              className="py-2.5 text-center text-xs font-medium uppercase tracking-[0.12em] text-neutral-500"
            >
              {weekday.slice(
                0,
                3,
              )}
            </div>
          ),
        )}

      </div>

      {/* DAYS */}

      <div className="grid grid-cols-7 gap-2">

        {calendarDays.map(
          (
            calendarDay,
            index,
          ) => {
            if (!calendarDay) {
              return (
                <div
                  key={`empty-${index}`}
                  aria-hidden="true"
                />
              );
            }

            const dayEntries =
              entries.filter(
                (entry) =>
                  entry.date ===
                  calendarDay.date,
              );

            const dailyPerformance =
              getDailyPerformance(
                account,
                entries,
                cashFlows,
                calendarDay.date,
              );

            return (
              <CalendarDay
                key={
                  calendarDay.date
                }
                day={
                  calendarDay.day
                }
                date={
                  calendarDay.date
                }
                entries={
                  dayEntries
                }
                returnPercentage={
                  dailyPerformance.returnPercentage
                }
                currency={
                  account.defaultCurrency
                }
                onClick={
                  onDayClick
                }
              />
            );
          },
        )}

      </div>

    </section>
  );
}