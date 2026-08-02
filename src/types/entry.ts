export type DisplayMode = "percentage" | "amount" | "both";

export interface PerformanceEntry {
  id: string;
  date: string;
  percentage: number | null;
  amount: number | null;
  notes?: string;
}

export interface DailyTotals {
  percentage: number;
  amount: number;
  entryCount: number;
}