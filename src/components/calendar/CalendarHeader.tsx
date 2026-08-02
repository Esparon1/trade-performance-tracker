import type { DisplayMode } from "../../types/entry";

interface CalendarHeaderProps {
  month: number;
  year: number;
  displayMode: DisplayMode;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onDisplayModeChange: (mode: DisplayMode) => void;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const years = Array.from(
  { length: 11 },
  (_, index) => 2021 + index,
);

export default function CalendarHeader({
  month,
  year,
  displayMode,
  onPreviousMonth,
  onNextMonth,
  onMonthChange,
  onYearChange,
  onDisplayModeChange,
}: CalendarHeaderProps) {
  return (
    <div className="my-8 flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <button
          type="button"
          onClick={onPreviousMonth}
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 hover:border-neutral-600"
        >
          ←
        </button>

        <label>
          <span className="mb-1 block text-xs text-neutral-500">
            Month
          </span>

          <select
            value={month}
            onChange={(event) =>
              onMonthChange(Number(event.target.value))
            }
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2"
          >
            {months.map((monthName, index) => (
              <option key={monthName} value={index}>
                {monthName}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1 block text-xs text-neutral-500">
            Year
          </span>

          <select
            value={year}
            onChange={(event) =>
              onYearChange(Number(event.target.value))
            }
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2"
          >
            {years.map((yearOption) => (
              <option key={yearOption} value={yearOption}>
                {yearOption}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={onNextMonth}
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 hover:border-neutral-600"
        >
          →
        </button>
      </div>

      <label>
        <span className="mb-1 block text-xs text-neutral-500">
          Calendar display
        </span>

        <select
          value={displayMode}
          onChange={(event) =>
            onDisplayModeChange(
              event.target.value as DisplayMode,
            )
          }
          className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2"
        >
          <option value="percentage">Percentage</option>
          <option value="amount">Amount</option>
          <option value="both">Both</option>
        </select>
      </label>
    </div>
  );
}