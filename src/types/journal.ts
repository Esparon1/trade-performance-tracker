export type JournalOptionSource = "recommended" | "custom";
export type JournalRecommendationKind = "strategy" | "tag";

export interface JournalOption {
  id: string;
  userId: string;
  name: string;
  isEnabled: boolean;
  isArchived: boolean;
  source: JournalOptionSource;
  createdAt: string;
  updatedAt: string;
}
export type JournalStrategy = JournalOption;
export type JournalTag = JournalOption;

export interface JournalRecommendation {
  id: string;
  kind: JournalRecommendationKind;
  name: string;
  sortOrder: number;
}

export interface TradeJournal {
  id: string;
  userId: string;
  entryId: string;
  ticker: string | null;
  companyName: string | null;
  strategyId: string | null;
  journalNotes: string | null;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SaveTradeJournalInput {
  entryId: string;
  ticker?: string | null;
  companyName?: string | null;
  strategyId?: string | null;
  journalNotes?: string | null;
  tagIds?: string[];
}

export interface JournalOptionRow {
  id: string;
  user_id: string;
  name: string;
  is_enabled: boolean;
  is_archived: boolean;
  source: JournalOptionSource;
  created_at: string;
  updated_at: string;
}

export interface TradeJournalRow {
  id: string;
  user_id: string;
  entry_id: string;
  ticker: string | null;
  company_name: string | null;
  strategy_id: string | null;
  journal_notes: string | null;
  created_at: string;
  updated_at: string;
}
