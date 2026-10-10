import type { PerformanceEntry } from "../../types/entry";
import type { TradeJournal } from "../../types/journal";

export interface JournalStats {
  count: number;
  wins: number;
  losses: number;
  breakeven: number;
  net: number;
  grossProfit: number;
  grossLoss: number;
  average: number;
  averageWin: number | null;
  averageLoss: number | null;
  winRate: number;
  profitFactor: number | null;
}
export interface JournalGroup extends JournalStats { id: string; label: string; }
export interface CurrencyJournalAnalytics {
  currency: string;
  overall: JournalStats;
  tickers: JournalGroup[];
  strategies: JournalGroup[];
  tags: JournalGroup[];
  missingCurrency: number;
}

export function calculateJournalStats(amounts: number[]): JournalStats {
  const wins = amounts.filter(v => v > 0);
  const losses = amounts.filter(v => v < 0);
  const grossProfit = wins.reduce((sum, v) => sum + v, 0);
  const grossLoss = -losses.reduce((sum, v) => sum + v, 0);
  const net = amounts.reduce((sum, v) => sum + v, 0);
  return {
    count: amounts.length, wins: wins.length, losses: losses.length,
    breakeven: amounts.length - wins.length - losses.length,
    net, grossProfit, grossLoss,
    average: amounts.length ? net / amounts.length : 0,
    averageWin: wins.length ? grossProfit / wins.length : null,
    averageLoss: losses.length ? -grossLoss / losses.length : null,
    winRate: amounts.length ? (wins.length / amounts.length) * 100 : 0,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : null,
  };
}

export function calculateJournalAnalytics(
  entries: PerformanceEntry[], journals: TradeJournal[],
  strategyNames: Map<string, string>, tagNames: Map<string, string>,
  currencyByAccount: Map<string, string>,
): { groups: CurrencyJournalAnalytics[]; excluded: number } {
  const journalByEntry = new Map(journals.map(j => [j.entryId, j]));
  const byCurrency = new Map<string, PerformanceEntry[]>();
  let excluded = 0;
  for (const entry of entries) {
    if (entry.amount === null || !Number.isFinite(entry.amount)) { excluded++; continue; }
    const currency = entry.currency ?? (entry.accountId ? currencyByAccount.get(entry.accountId) : undefined);
    if (!currency) { excluded++; continue; }
    const list = byCurrency.get(currency) ?? [];
    list.push(entry);
    byCurrency.set(currency, list);
  }
  function breakdown(rows: PerformanceEntry[], getLabels: (j: TradeJournal | undefined) => {id: string; label: string}[]): JournalGroup[] {
    const buckets = new Map<string, {label: string; amounts: number[]}>();
    for (const entry of rows) {
      const labels = getLabels(journalByEntry.get(entry.id));
      for (const {id, label} of labels) {
        const bucket = buckets.get(id) ?? {label, amounts: []};
        bucket.amounts.push(entry.amount as number);
        buckets.set(id, bucket);
      }
    }
    return [...buckets].map(([id, b]) => ({id, label: b.label, ...calculateJournalStats(b.amounts)}))
      .sort((a,b) => b.net - a.net || b.count - a.count || a.label.localeCompare(b.label));
  }
  const groups = [...byCurrency].sort(([a],[b]) => a.localeCompare(b)).map(([currency, rows]) => ({
    currency, overall: calculateJournalStats(rows.map(e => e.amount as number)), missingCurrency: 0,
    tickers: breakdown(rows, j => j?.ticker?.trim() ? [{id:j.ticker.trim().toUpperCase(),label:j.ticker.trim().toUpperCase()}] : []),
    strategies: breakdown(rows, j => j?.strategyId ? [{id:j.strategyId,label:strategyNames.get(j.strategyId) ?? "Unknown strategy"}] : []),
    tags: breakdown(rows, j => [...new Set(j?.tagIds ?? [])].map(id => ({id,label:tagNames.get(id) ?? "Unknown tag"}))),
  }));
  return {groups, excluded};
}
