import type { CurrencyCode } from "./account";

export type CashFlowType =
  | "deposit"
  | "withdrawal";

export interface CashFlow {
  id: string;
  accountId: string;
  date: string;
  type: CashFlowType;
  amount: number;
  currency: CurrencyCode;
  notes?: string;
  createdAt?: string;
}

export interface CashFlowRow {
  id: string;
  user_id: string;
  account_id: string;
  flow_date: string;
  flow_type: CashFlowType;
  amount: number | string;
  currency: CurrencyCode;
  notes: string | null;
  created_at: string;
}

export interface CreateCashFlowInput {
  accountId: string;
  date: string;
  type: CashFlowType;
  amount: number;
  currency: CurrencyCode;
  notes?: string;
}