export type DisplayMode =
  | "percentage"
  | "amount"
  | "both";

export interface PerformanceEntry {
  id: string;
  date: string;
  percentage: number | null;
  amount: number | null;
  notes?: string;
  createdAt?: string;
}

export interface DailyTotals {
  percentage: number;
  amount: number;
  entryCount: number;
}

export interface PerformanceEntryRow {
  id: string;
  user_id: string;
  entry_date: string;
  percentage: number | string | null;
  amount: number | string | null;
  notes: string | null;
  created_at: string;
}