import type {
  DailyTotals,
  PerformanceEntry,
} from "../types/entry";

export interface CalendarDayData {
  day: number;
  date: string;
}

export function createDateKey(
  year: number,
  month: number,
  day: number,
): string {
  const paddedMonth = String(month + 1).padStart(2, "0");
  const paddedDay = String(day).padStart(2, "0");

  return `${year}-${paddedMonth}-${paddedDay}`;
}

export function getCalendarDays(
  year: number,
  month: number,
): Array<CalendarDayData | null> {
  const normalWeekday = new Date(year, month, 1).getDay();

  // Converts Sunday-first JavaScript dates to Monday-first.
  const firstWeekday = (normalWeekday + 6) % 7;

  const numberOfDays = new Date(
    year,
    month + 1,
    0,
  ).getDate();

  const days: Array<CalendarDayData | null> = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= numberOfDays; day += 1) {
    days.push({
      day,
      date: createDateKey(year, month, day),
    });
  }

  return days;
}

export function calculateDailyTotals(
  entries: PerformanceEntry[],
): DailyTotals {
  return entries.reduce<DailyTotals>(
    (totals, entry) => ({
      percentage:
        totals.percentage + (entry.percentage ?? 0),

      amount:
        totals.amount + (entry.amount ?? 0),

      entryCount: totals.entryCount + 1,
    }),
    {
      percentage: 0,
      amount: 0,
      entryCount: 0,
    },
  );
}

export function getEntryDirection(
  totals: DailyTotals,
): "positive" | "negative" | "neutral" {
  // Use the amount when it is not zero.
  if (totals.amount > 0) {
    return "positive";
  }

  if (totals.amount < 0) {
    return "negative";
  }

  // If the amount is zero or absent, use percentage.
  if (totals.percentage > 0) {
    return "positive";
  }

  if (totals.percentage < 0) {
    return "negative";
  }

  return "neutral";
}