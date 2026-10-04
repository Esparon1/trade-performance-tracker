interface CalendarHeaderProps {
  month: number;
  year: number;

  onPreviousMonth: () => void;
  onNextMonth: () => void;

  onMonthChange: (
    month: number,
  ) => void;

  onYearChange: (
    year: number,
  ) => void;
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
  {
    length: 11,
  },
  (_, index) =>
    2021 + index,
);

export default function CalendarHeader({
  month,
  year,
  onPreviousMonth,
  onNextMonth,
  onMonthChange,
  onYearChange,
}: CalendarHeaderProps) {
  return (
    <div className="mb-6 mt-10">

      {/* MONTH TITLE */}

      <div className="mb-6">
        <h2 className="text-3xl font-semibold tracking-tight text-white">
          {months[month]}

          <span className="ml-3 font-normal text-neutral-300">
            {year}
          </span>
        </h2>
      </div>

      {/* CONTROLS */}

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-white/[0.08] bg-black/35 p-4 shadow-[0_15px_45px_rgba(0,0,0,0.18)] backdrop-blur-md">

        {/* PREVIOUS */}

        <button
          type="button"
          onClick={
            onPreviousMonth
          }
          aria-label="Previous month"
          className="
            flex
            h-[42px]
            w-[42px]
            items-center
            justify-center
            rounded-xl
            border
            border-white/[0.10]
            bg-white/[0.04]
            text-lg
            text-neutral-300
            transition-all
            duration-200
            hover:border-emerald-500/35
            hover:bg-emerald-500/[0.08]
            hover:text-emerald-300
            hover:shadow-[0_0_18px_rgba(16,185,129,0.10)]
          "
        >
          ←
        </button>

        {/* MONTH */}

        <label>
          <span className="mb-1.5 block text-xs font-medium text-neutral-400">
            Month
          </span>

          <select
            value={month}
            onChange={(event) =>
              onMonthChange(
                Number(
                  event.target.value,
                ),
              )
            }
            className="h-[42px] min-w-[150px] rounded-xl border border-white/[0.10] bg-[#151817] px-4 text-sm font-medium text-neutral-200 outline-none transition-all focus:border-emerald-500/40"
          >
            {months.map(
              (
                monthName,
                index,
              ) => (
                <option
                  key={
                    monthName
                  }
                  value={index}
                >
                  {monthName}
                </option>
              ),
            )}
          </select>
        </label>

        {/* YEAR */}

        <label>
          <span className="mb-1.5 block text-xs font-medium text-neutral-400">
            Year
          </span>

          <select
            value={year}
            onChange={(event) =>
              onYearChange(
                Number(
                  event.target.value,
                ),
              )
            }
            className="h-[42px] rounded-xl border border-white/[0.10] bg-[#151817] px-4 text-sm font-medium text-neutral-200 outline-none transition-all focus:border-emerald-500/40"
          >
            {years.map(
              (yearOption) => (
                <option
                  key={
                    yearOption
                  }
                  value={
                    yearOption
                  }
                >
                  {yearOption}
                </option>
              ),
            )}
          </select>
        </label>

        {/* NEXT */}

        <button
          type="button"
          onClick={
            onNextMonth
          }
          aria-label="Next month"
          className="
            flex
            h-[42px]
            w-[42px]
            items-center
            justify-center
            rounded-xl
            border
            border-white/[0.10]
            bg-white/[0.04]
            text-lg
            text-neutral-300
            transition-all
            duration-200
            hover:border-emerald-500/35
            hover:bg-emerald-500/[0.08]
            hover:text-emerald-300
            hover:shadow-[0_0_18px_rgba(16,185,129,0.10)]
          "
        >
          →
        </button>

      </div>
    </div>
  );
}