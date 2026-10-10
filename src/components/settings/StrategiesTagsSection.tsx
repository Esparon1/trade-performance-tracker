import { useEffect, useMemo, useState } from "react";
import { useJournalTaxonomy } from "../../hooks/useJournalTaxonomy";
import type { JournalOption } from "../../types/journal";

type Kind = "strategy" | "tag";

export default function StrategiesTagsSection() {
  const taxonomy = useJournalTaxonomy();
  const [kind, setKind] = useState<Kind>("strategy");
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => { void taxonomy.load(); }, [taxonomy.load]);

  const options = kind === "strategy" ? taxonomy.strategies : taxonomy.tags;
  const recommendations = useMemo(() => taxonomy.recommendations.filter(r => r.kind === kind), [taxonomy.recommendations, kind]);
  const available = recommendations.filter(r => !options.some(o => o.name.trim().toLowerCase() === r.name.trim().toLowerCase()));

  async function add(value: string, source: "custom" | "recommended") {
    setNotice("");
    const result = await taxonomy.create(kind, value, source);
    if (result) { setName(""); setNotice(`${result.name} added.`); }
  }
  async function toggle(option: JournalOption) {
    setNotice("");
    const result = await taxonomy.setEnabled(kind, option.id, !option.isEnabled);
    if (result) setNotice(`${result.name} ${result.isEnabled ? "enabled" : "hidden"}.`);
  }
  async function rename(option: JournalOption) {
    setNotice("");
    const result = await taxonomy.rename(kind, option.id, editName);
    if (result) { setEditingId(null); setNotice("Name updated."); }
  }
  async function archive(option: JournalOption) {
    if (!window.confirm(`Archive ${option.name}? Existing trade history will retain its reference.`)) return;
    setNotice("");
    const result = await taxonomy.archive(kind, option.id);
    if (result) setNotice(`${option.name} archived.`);
  }

  return (
    <section>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400/70">Settings</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Strategies &amp; Tags</h2>
      <p className="mt-2 text-sm text-neutral-500">Customize what appears when recording trades. Hidden options remain on past trades.</p>
      <div className="mt-7 flex gap-2">
        {(["strategy", "tag"] as const).map(value => (
          <button key={value} type="button" onClick={() => { setKind(value); setEditingId(null); setNotice(""); }}
            className={`rounded-xl border px-4 py-2 text-sm transition ${kind === value ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-white/10 text-neutral-400 hover:text-white"}`}>
            {value === "strategy" ? "Strategies" : "Tags"}
          </button>
        ))}
      </div>
      {taxonomy.error && <p role="alert" className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{taxonomy.error}</p>}
      {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">{notice}</p>}
      {taxonomy.loading ? <p className="mt-8 text-sm text-neutral-400">Loading options...</p> : (
        <>
          <div className="mt-8">
            <h3 className="text-base font-semibold text-white">Your {kind === "strategy" ? "strategies" : "tags"}</h3>
            <p className="mt-1 text-xs text-neutral-500">Enabled options will be available in future trade forms.</p>
            <div className="mt-4 space-y-2">
              {options.length === 0 && <p className="rounded-xl border border-white/10 p-4 text-sm text-neutral-500">No options yet. Choose a recommendation or create your own.</p>}
              {options.map(option => (
                <div key={option.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
                  <label className="flex min-w-0 flex-1 items-center gap-3 text-sm text-neutral-200">
                    <input type="checkbox" checked={option.isEnabled} disabled={taxonomy.saving} onChange={() => void toggle(option)} className="accent-emerald-500" />
                    <span className={option.isEnabled ? "truncate" : "truncate text-neutral-500"}>{option.name}</span>
                    <span className="text-xs text-neutral-600">{option.source === "recommended" ? "Recommended" : "Custom"}</span>
                  </label>
                  {editingId === option.id ? (
                    <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                      <input aria-label="Rename option" maxLength={100} value={editName} onChange={e => setEditName(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#151817] px-3 py-2 text-sm text-white sm:w-40" />
                      <button type="button" disabled={taxonomy.saving || !editName.trim()} onClick={() => void rename(option)} className="text-sm text-emerald-300 disabled:opacity-40">Save</button>
                      <button type="button" onClick={() => setEditingId(null)} className="text-sm text-neutral-400">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-xs">
                      <button type="button" disabled={taxonomy.saving} onClick={() => { setEditingId(option.id); setEditName(option.name); }} className="text-neutral-400 hover:text-white disabled:opacity-40">Rename</button>
                      <button type="button" disabled={taxonomy.saving} onClick={() => void archive(option)} className="text-neutral-500 hover:text-red-300 disabled:opacity-40">Archive</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-9">
            <h3 className="text-base font-semibold text-white">Recommended {kind === "strategy" ? "strategies" : "tags"}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {available.length === 0 && <p className="text-sm text-neutral-500">All recommendations have been added.</p>}
              {available.map(item => <button key={item.id} type="button" disabled={taxonomy.saving} onClick={() => void add(item.name, "recommended")} className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2 text-sm text-emerald-300 transition hover:bg-emerald-500/15 disabled:opacity-40">+ {item.name}</button>)}
            </div>
          </div>
          <form className="mt-9" onSubmit={e => { e.preventDefault(); if (name.trim()) void add(name.trim(), "custom"); }}>
            <label htmlFor="journal-custom-name" className="text-base font-semibold text-white">Create custom {kind}</label>
            <div className="mt-3 flex flex-wrap gap-2">
              <input id="journal-custom-name" maxLength={100} value={name} onChange={e => setName(e.target.value)} placeholder={kind === "strategy" ? "e.g. Gap and Go" : "e.g. Chased entry"} className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-[#151817] px-4 text-sm text-white outline-none focus:border-emerald-500/40" />
              <button type="submit" disabled={taxonomy.saving || !name.trim()} className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-5 py-2 text-sm font-medium text-emerald-300 disabled:opacity-40">{taxonomy.saving ? "Saving..." : "Add"}</button>
            </div>
          </form>
        </>
      )}
    </section>
  );
}
