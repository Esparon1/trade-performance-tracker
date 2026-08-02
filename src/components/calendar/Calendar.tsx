import type {
  DisplayMode,
  PerformanceEntry,
} from "../../types/entry";

import { getCalendarDays } from "../../utils/calendar";
import CalendarDay from "./CalendarDay";

interface CalendarProps {
  year: number;
  month: number;
  entries: PerformanceEntry[];
  displayMode: DisplayMode;
  onDayClick: (date: string) => void;
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
  displayMode,
  onDayClick,
}: CalendarProps) {
  const calendarDays = getCalendarDays(year, month);

  return (
    <section>
      <div className="mb-2 grid grid-cols-7 gap-2">
        {weekdays.map((weekday) => (
          <div
            key={weekday}
            className="py-2 text-center text-sm text-neutral-500"
          >
            {weekday.slice(0, 3)}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((calendarDay, index) => {
          if (!calendarDay) {
            return (
              <div
                key={`empty-${index}`}
                aria-hidden="true"
              />
            );
          }

          const dayEntries = entries.filter(
            (entry) => entry.date === calendarDay.date,
          );

          return (
            <CalendarDay
              key={calendarDay.date}
              day={calendarDay.day}
              date={calendarDay.date}
              entries={dayEntries}
              displayMode={displayMode}
              onClick={onDayClick}
            />
          );
        })}
      </div>
    </section>
  );
}