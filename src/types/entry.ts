import type {
  CurrencyCode,
} from "./account";

export interface PerformanceEntry {
  id: string;

  accountId: string | null;

  date: string;

  percentage: number | null;

  amount: number | null;

  currency: CurrencyCode | null;

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

  account_id: string | null;

  entry_date: string;

  percentage:
    | number
    | string
    | null;

  amount:
    | number
    | string
    | null;

  currency:
    | CurrencyCode
    | null;

  notes: string | null;

  created_at: string;
}