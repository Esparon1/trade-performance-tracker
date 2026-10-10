import { useMemo, useState } from "react";
import type { Account } from "../../types/account";
import type { PerformanceEntry } from "../../types/entry";
import type { JournalOption, TradeJournal } from "../../types/journal";
import { calculateJournalAnalytics, type JournalGroup, type JournalStats } from "../../utils/journal/journalAnalytics";

interface Props { entries: PerformanceEntry[]; journals: TradeJournal[]; strategies: JournalOption[]; tags: JournalOption[]; accounts: Account[]; }
const money = (value: number, currency: string) => new Intl.NumberFormat("en-CA", {style:"currency",currency,maximumFractionDigits:2}).format(value);
const pct = (value: number) => `${value.toFixed(1)}%`;
const signed = (value: number) => value >= 0 ? "text-emerald-400" : "text-red-400";
function Metric({label,value, color}: {label:string;value:string;color?:string}) {
  return <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3"><p className="text-xs text-neutral-500">{label}</p><p className={`mt-1 text-lg font-semibold ${color ?? "text-white"}`}>{value}</p></div>;
}
function Summary({stats,currency}: {stats:JournalStats;currency:string}) {
  return <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5">
    <Metric label="Trades" value={String(stats.count)}/>
    <Metric label="Win rate" value={pct(stats.winRate)}/>
    <Metric label="Net realized P/L" value={money(stats.net,currency)} color={signed(stats.net)}/>
    <Metric label="Avg P/L per trade" value={money(stats.average,currency)} color={signed(stats.average)}/>
    <Metric label="Profit factor" value={stats.profitFactor === null ? (stats.grossProfit > 0 ? "∞" : "N/A") : stats.profitFactor.toFixed(2)}/>
    <Metric label="Winning trades" value={String(stats.wins)}/>
    <Metric label="Losing trades" value={String(stats.losses)}/>
    <Metric label="Average win" value={stats.averageWin === null ? "—" : money(stats.averageWin,currency)}/>
    <Metric label="Average loss" value={stats.averageLoss === null ? "—" : money(stats.averageLoss,currency)}/>
    <Metric label="Breakeven trades" value={String(stats.breakeven)}/>
  </div>;
}
function Breakdown({title,rows,currency}: {title:string;rows:JournalGroup[];currency:string}) {
  return <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-black/20">
    <h4 className="border-b border-white/[0.08] px-4 py-3 text-sm font-medium text-white">{title}</h4>
    {rows.length === 0 ? <p className="p-4 text-sm text-neutral-500">No labeled trades in the current filters.</p> :
    <div className="overflow-x-auto"><table className="w-full min-w-[540px] text-left text-sm"><thead className="text-xs text-neutral-500"><tr className="border-b border-white/[0.06]"><th className="px-4 py-3 font-medium">Name</th><th className="px-3 py-3 text-right font-medium">Trades</th><th className="px-3 py-3 text-right font-medium">Win rate</th><th className="px-3 py-3 text-right font-medium">Avg P/L</th><th className="px-4 py-3 text-right font-medium">Net P/L</th></tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-b border-white/[0.04] last:border-0"><td className="px-4 py-3 text-neutral-200">{row.label}</td><td className="px-3 py-3 text-right text-neutral-400">{row.count}</td><td className="px-3 py-3 text-right text-neutral-300">{pct(row.winRate)}</td><td className={`px-3 py-3 text-right ${signed(row.average)}`}>{money(row.average,currency)}</td><td className={`px-4 py-3 text-right font-medium ${signed(row.net)}`}>{money(row.net,currency)}</td></tr>)}</tbody></table></div>}
  </div>;
}
export default function JournalAnalytics({entries,journals,strategies,tags,accounts}:Props) {
  const [expanded,setExpanded] = useState(true);
  const analytics = useMemo(() => calculateJournalAnalytics(entries,journals,
    new Map(strategies.map(s=>[s.id,s.name])), new Map(tags.map(t=>[t.id,t.name])),
    new Map(accounts.map(a=>[a.id,a.defaultCurrency]))), [entries,journals,strategies,tags,accounts]);
  return <section className="space-y-4 rounded-2xl border border-white/[0.08] bg-black/25 p-4 sm:p-5">
    <div className="flex items-center justify-between gap-3"><div><h3 className="text-lg font-semibold text-white">Journal analytics</h3><p className="mt-1 text-xs text-neutral-500">Based on the current Journal filters. Each entry counts as one trade.</p></div><button type="button" onClick={()=>setExpanded(v=>!v)} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-neutral-300 hover:text-white">{expanded?"Hide analytics":"Show analytics"}</button></div>
    {expanded && <div className="space-y-6">
      {analytics.excluded > 0 && <p className="text-xs text-amber-300">{analytics.excluded} entries excluded because their P/L or currency is unavailable.</p>}
      {analytics.groups.length === 0 ? <p className="text-sm text-neutral-500">No realized P/L data matches these filters.</p> : analytics.groups.map(group => <div key={group.currency} className="space-y-4"><h4 className="border-b border-white/10 pb-2 text-sm font-semibold text-emerald-300">{group.currency} performance</h4><Summary stats={group.overall} currency={group.currency}/><div className="grid gap-4 xl:grid-cols-2"><Breakdown title="By ticker" rows={group.tickers} currency={group.currency}/><Breakdown title="By strategy" rows={group.strategies} currency={group.currency}/><div className="xl:col-span-2"><Breakdown title="By tag" rows={group.tags} currency={group.currency}/></div></div></div>)}
      <p className="text-xs leading-relaxed text-neutral-500">Zero-P/L entries count as breakeven, not wins. Profit factor = gross winning P/L / absolute gross losing P/L; ∞ means profits with no losses, N/A means neither. Untagged or unlabeled trades remain in totals but not their respective breakdown. A trade with multiple tags appears in each tag group, so tag totals must not be added together. CAD and USD are calculated separately.</p>
    </div>}
  </section>;
}
