import { useEffect, useMemo, useState } from "react";
import type { Account } from "../../types/account";
import type { PerformanceEntry } from "../../types/entry";
import type { JournalOption, TradeJournal } from "../../types/journal";
import { getTradeJournals } from "../../services/tradeJournals";
import { getJournalOptions } from "../../services/journalTaxonomy";
import { formatAmount } from "../../utils/format";
import JournalAnalytics from "./JournalAnalytics";

interface Props {
  entries: PerformanceEntry[];
  accounts: Account[];
  selectedAccountId: string | null;
  loadingEntries: boolean;
  refreshToken: number;
  onOpenTrade: (entry: PerformanceEntry) => void;
}
const selectClass = "w-full rounded-xl border border-white/10 bg-[#151817] px-3 py-2.5 text-sm text-neutral-200 outline-none focus:border-emerald-500/40";

export default function JournalView({ entries, accounts, selectedAccountId, loadingEntries, refreshToken, onOpenTrade }: Props) {
  const [journals, setJournals] = useState<TradeJournal[]>([]);
  const [strategies, setStrategies] = useState<JournalOption[]>([]);
  const [tags, setTags] = useState<JournalOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [accountId, setAccountId] = useState(selectedAccountId ?? "all");
  const [strategyId, setStrategyId] = useState("all");
  const [tagId, setTagId] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  // Follow dashboard account changes, but preserve manual Journal filtering between tabs.
  useEffect(() => {
    setAccountId(selectedAccountId ?? "all");
    setPage(1);
  }, [selectedAccountId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [journalRows, strategyRows, tagRows] = await Promise.all([
          getTradeJournals(), getJournalOptions("strategy", true), getJournalOptions("tag", true),
        ]);
        if (!cancelled) {
          setJournals(journalRows);
          setStrategies(strategyRows);
          setTags(tagRows);
        }
      } catch (caught) {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "Could not load journal data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [refreshToken]);

  const journalByEntry = useMemo(() => new Map(journals.map(journal => [journal.entryId, journal])), [journals]);
  const accountById = useMemo(() => new Map(accounts.map(account => [account.id, account])), [accounts]);
  const strategyById = useMemo(() => new Map(strategies.map(strategy => [strategy.id, strategy.name])), [strategies]);
  const tagById = useMemo(() => new Map(tags.map(tag => [tag.id, tag.name])), [tags]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries.filter(entry => {
      const journal = journalByEntry.get(entry.id);
      if (accountId !== "all" && entry.accountId !== accountId) return false;
      if (strategyId !== "all" && journal?.strategyId !== strategyId) return false;
      if (tagId !== "all" && !journal?.tagIds.includes(tagId)) return false;
      if (startDate && entry.date < startDate) return false;
      if (endDate && entry.date > endDate) return false;
      if (term) {
        const haystack = [journal?.ticker, journal?.companyName, journal?.journalNotes,
          entry.notes, journal?.strategyId ? strategyById.get(journal.strategyId) : "",
          ...(journal?.tagIds.map(id => tagById.get(id) ?? "") ?? [])].join(" ").toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
  }, [entries, journalByEntry, accountId, strategyId, tagId, startDate, endDate, search, strategyById, tagById]);

  const pageSize = 25;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const resetPage = () => setPage(1);

  return (
    <section className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400/70">Trading Journal</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Trade history</h2>
        <p className="mt-1 text-sm text-neutral-500">Search and review trades across your accounts. Select a trade to open its day and edit it.</p>
      </div>
      <div className="grid gap-3 rounded-2xl border border-white/[0.08] bg-black/25 p-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-xs text-neutral-400">Search ticker, company, notes or labels
          <input className={`mt-1 ${selectClass}`} value={search} placeholder="e.g. ONDS, breakout" onChange={e => { setSearch(e.target.value); resetPage(); }} />
        </label>
        <label className="text-xs text-neutral-400">Account
          <select className={`mt-1 ${selectClass}`} value={accountId} onChange={e => { setAccountId(e.target.value); resetPage(); }}>
            <option value="all">All accounts</option>
            {accounts.map(account => <option key={account.id} value={account.id}>{account.name}</option>)}
          </select>
        </label>
        <label className="text-xs text-neutral-400">Strategy
          <select className={`mt-1 ${selectClass}`} value={strategyId} onChange={e => { setStrategyId(e.target.value); resetPage(); }}>
            <option value="all">All strategies</option>
            {strategies.map(strategy => <option key={strategy.id} value={strategy.id}>{strategy.name}{strategy.isArchived ? " (archived)" : ""}</option>)}
          </select>
        </label>
        <label className="text-xs text-neutral-400">Tag
          <select className={`mt-1 ${selectClass}`} value={tagId} onChange={e => { setTagId(e.target.value); resetPage(); }}>
            <option value="all">All tags</option>
            {tags.map(tag => <option key={tag.id} value={tag.id}>{tag.name}{tag.isArchived ? " (archived)" : ""}</option>)}
          </select>
        </label>
        <label className="text-xs text-neutral-400">From
          <input type="date" className={`mt-1 ${selectClass}`} value={startDate} onChange={e => { setStartDate(e.target.value); resetPage(); }} />
        </label>
        <label className="text-xs text-neutral-400">To
          <input type="date" className={`mt-1 ${selectClass}`} value={endDate} onChange={e => { setEndDate(e.target.value); resetPage(); }} />
        </label>
      </div>
      {!loading && !loadingEntries && !error && <JournalAnalytics entries={filtered} journals={journals} strategies={strategies} tags={tags} accounts={accounts} />}
      {error && <p role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>}
      {(loading || loadingEntries) && <p className="text-sm text-neutral-400">Loading trades and journal details...</p>}
      {!loading && !loadingEntries && (
        <>
          <p className="text-sm text-neutral-400">{filtered.length} {filtered.length === 1 ? "trade" : "trades"} found</p>
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-10 text-center text-neutral-400">No trades match your filters.</div>
          ) : (
            <div className="space-y-3">
              {visible.map(entry => {
                const journal = journalByEntry.get(entry.id);
                const account = entry.accountId ? accountById.get(entry.accountId) : undefined;
                return (
                  <article key={entry.id} className="rounded-2xl border border-white/[0.08] bg-black/25 p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-neutral-500">{entry.date} · {account?.name ?? "Unassigned account"}</p>
                        <h3 className="mt-1 font-semibold text-white">{journal?.ticker || "Untitled trade"}{journal?.companyName && <span className="ml-2 text-sm font-normal text-neutral-400">{journal.companyName}</span>}</h3>
                        {journal?.strategyId && <p className="mt-1 text-xs text-emerald-300">{strategyById.get(journal.strategyId) ?? "Unknown strategy"}</p>}
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${entry.amount === null ? "text-neutral-400" : entry.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {entry.amount === null ? "—" : formatAmount(entry.amount)} <span className="text-xs text-neutral-500">{entry.currency ?? account?.defaultCurrency ?? ""}</span>
                        </p>
                        {account && <button type="button" onClick={() => onOpenTrade(entry)} className="mt-2 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-neutral-200 hover:border-emerald-500/40">Open / Edit</button>}
                      </div>
                    </div>
                    {!!journal?.tagIds.length && <div className="mt-3 flex flex-wrap gap-2">{journal.tagIds.map(id => <span key={id} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-neutral-300">{tagById.get(id) ?? "Unknown tag"}</span>)}</div>}
                    {entry.notes && <p className="mt-3 whitespace-pre-wrap text-sm text-neutral-300">{entry.notes}</p>}
                    {journal?.journalNotes && <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-400">{journal.journalNotes}</p>}
                  </article>
                );
              })}
            </div>
          )}
          {pageCount > 1 && <div className="flex items-center justify-center gap-4 pt-2 text-sm text-neutral-400">
            <button type="button" disabled={currentPage === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-40">Previous</button>
            <span>Page {currentPage} of {pageCount}</span>
            <button type="button" disabled={currentPage === pageCount} onClick={() => setPage(p => Math.min(pageCount, p + 1))} className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-40">Next</button>
          </div>}
        </>
      )}
    </section>
  );
}
