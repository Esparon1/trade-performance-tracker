import {

  useEffect,

  useState,
  useCallback,

} from "react";

import type {

  Account,

  CurrencyCode,

} from "../../types/account";

import type {

  PerformanceEntry,

} from "../../types/entry";

import type { JournalOption, TradeJournal } from "../../types/journal";
import { getJournalOptions, createJournalOption } from "../../services/journalTaxonomy";
import { getTradeJournals, saveTradeJournal } from "../../services/tradeJournals";
import {

  formatAmount,

  formatDate,

} from "../../utils/format";

interface AddEntryInput {

  accountId: string;

  date: string;

  amount: number;

  currency: CurrencyCode;

  percentage?: number | null;

  notes?: string;

}

interface UpdateEntryInput {

  date: string;

  amount: number;

  notes?: string;

}

interface DailyEntryModalProps {

  date: string;

  entries: PerformanceEntry[];

  account: Account;

  saving: boolean;

  deletingEntryId:

    | string

    | null;

  onClose: () => void;

  onAddEntry: (

    entry: AddEntryInput,

  ) => Promise<string | null>;

  onDeleteEntry: (

    id: string,

  ) => Promise<void>;

  onUpdateEntry: (id: string, changes: UpdateEntryInput) => Promise<boolean>;

}

export default function DailyEntryModal({

  date,

  entries,

  account,

  saving,

  deletingEntryId,

  onClose,

  onAddEntry,

  onDeleteEntry,

  onUpdateEntry,

}: DailyEntryModalProps) {

  const [amount, setAmount] =

    useState("");

  const [notes, setNotes] =

    useState("");

  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [editDate, setEditDate] = useState("");

  const [editAmount, setEditAmount] = useState("");

  const [editNotes, setEditNotes] = useState("");

  const [editError, setEditError] = useState("");
  const [journals, setJournals] = useState<TradeJournal[]>([]);
  const [strategies, setStrategies] = useState<JournalOption[]>([]);
  const [tags, setTags] = useState<JournalOption[]>([]);
  const [journalLoading, setJournalLoading] = useState(false);
  const [journalBusy, setJournalBusy] = useState(false);
  const [pendingEntryId, setPendingEntryId] = useState<string | null>(null);
  const [journalError, setJournalError] = useState("");
  const [ticker, setTicker] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [strategyId, setStrategyId] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [journalNotes, setJournalNotes] = useState("");
  const [editTicker, setEditTicker] = useState("");
  const [editCompanyName, setEditCompanyName] = useState("");
  const [editStrategyId, setEditStrategyId] = useState("");
  const [editTagIds, setEditTagIds] = useState<string[]>([]);
  const [editJournalNotes, setEditJournalNotes] = useState("");

  const refreshJournalData = useCallback(async () => {
    setJournalLoading(true);
    try {
      const [nextStrategies, nextTags, nextJournals] = await Promise.all([
        getJournalOptions("strategy", true), getJournalOptions("tag", true), getTradeJournals(),
      ]);
      setStrategies(nextStrategies);
      setTags(nextTags);
      setJournals(nextJournals);
      setJournalError("");
    } catch (caught) {
      setJournalError(caught instanceof Error ? caught.message : "Could not load journal details.");
    } finally { setJournalLoading(false); }
  }, []);

  useEffect(() => { void refreshJournalData(); }, [refreshJournalData]);

  async function addCustomOption(kind: "strategy" | "tag", editing: boolean) {
    const name = window.prompt(`New ${kind} name (max 100 characters):`)?.trim();
    if (!name) return;
    setJournalBusy(true);
    setJournalError("");
    try {
      const option = await createJournalOption(kind, name);
      if (kind === "strategy") {
        setStrategies(current => [...current, option]);
        if (editing) setEditStrategyId(option.id); else setStrategyId(option.id);
      } else {
        setTags(current => [...current, option]);
        if (editing) setEditTagIds(current => [...new Set([...current, option.id])]);
        else setTagIds(current => [...new Set([...current, option.id])]);
      }
    } catch (caught) {
      setJournalError(caught instanceof Error ? caught.message : "Could not create option.");
    } finally { setJournalBusy(false); }
  }

  function JournalFields({ editing }: { editing: boolean }) {
    const currentTicker = editing ? editTicker : ticker;
    const currentCompany = editing ? editCompanyName : companyName;
    const currentStrategy = editing ? editStrategyId : strategyId;
    const currentTags = editing ? editTagIds : tagIds;
    const currentNotes = editing ? editJournalNotes : journalNotes;
    const visibleStrategies = strategies.filter(item => (!item.isArchived && item.isEnabled) || item.id === currentStrategy);
    const visibleTags = tags.filter(item => (!item.isArchived && item.isEnabled) || currentTags.includes(item.id));
    const inputStyle = "mt-1 w-full rounded-lg border border-white/10 bg-[#151817] px-3 py-2 text-sm text-white";
    return (
      <div className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
        <p className="text-sm font-medium text-emerald-300">Trading journal <span className="font-normal text-neutral-500">(optional)</span></p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs text-neutral-400">Ticker
            <input maxLength={32} placeholder="NVDA" value={currentTicker} onChange={e => editing ? setEditTicker(e.target.value) : setTicker(e.target.value)} className={inputStyle}/>
          </label>
          <label className="text-xs text-neutral-400">Company
            <input maxLength={200} placeholder="NVIDIA" value={currentCompany} onChange={e => editing ? setEditCompanyName(e.target.value) : setCompanyName(e.target.value)} className={inputStyle}/>
          </label>
        </div>
        <label className="block text-xs text-neutral-400">Strategy
          <div className="mt-1 flex gap-2">
            <select value={currentStrategy} onChange={e => editing ? setEditStrategyId(e.target.value) : setStrategyId(e.target.value)} className={inputStyle + " mt-0"}>
              <option value="">No strategy</option>
              {visibleStrategies.map(item => <option key={item.id} value={item.id}>{item.name}{item.isArchived || !item.isEnabled ? " (hidden)" : ""}</option>)}
            </select>
            <button type="button" disabled={journalBusy} onClick={() => void addCustomOption("strategy", editing)} className="rounded-lg border border-white/10 px-3 text-sm text-emerald-300">+ New</button>
          </div>
        </label>
        <div>
          <div className="flex items-center justify-between"><span className="text-xs text-neutral-400">Tags (select multiple)</span><button type="button" disabled={journalBusy} onClick={() => void addCustomOption("tag", editing)} className="text-xs text-emerald-300">+ New tag</button></div>
          <div className="mt-2 flex flex-wrap gap-2">
            {visibleTags.length === 0 && <span className="text-xs text-neutral-500">No tags enabled. Add one in Settings or here.</span>}
            {visibleTags.map(item => <label key={item.id} className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-neutral-300"><input type="checkbox" checked={currentTags.includes(item.id)} onChange={e => {
              const update = (ids: string[]) => e.target.checked ? [...new Set([...ids, item.id])] : ids.filter(id => id !== item.id);
              if (editing) setEditTagIds(update); else setTagIds(update);
            }}/>{item.name}{(item.isArchived || !item.isEnabled) && " (hidden)"}</label>)}
          </div>
        </div>
        <label className="block text-xs text-neutral-400">Journal notes
          <textarea rows={3} value={currentNotes} onChange={e => editing ? setEditJournalNotes(e.target.value) : setJournalNotes(e.target.value)} placeholder="Why did you enter? What did you learn?" className={inputStyle}/>
        </label>
      </div>
    );
  }




  function beginEdit(entry: PerformanceEntry) {

    setEditingId(entry.id);

    setEditDate(entry.date);

    setEditAmount(entry.amount === null ? "" : String(entry.amount));

    setEditNotes(entry.notes ?? "");

    const journal = journals.find(item => item.entryId === entry.id);
    setEditTicker(journal?.ticker ?? "");
    setEditCompanyName(journal?.companyName ?? "");
    setEditStrategyId(journal?.strategyId ?? "");
    setEditTagIds(journal?.tagIds ?? []);
    setEditJournalNotes(journal?.journalNotes ?? "");
    setEditError("");

  }



  async function saveEdit() {

    if (!editingId) return;

    const parsedAmount = Number(editAmount.trim());

    if (!editAmount.trim() || !Number.isFinite(parsedAmount)) {

      setEditError("Enter a valid P/L amount.");

      return;

    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(editDate) ||

        Number.isNaN(new Date(`${editDate}T12:00:00`).getTime())) {

      setEditError("Enter a valid date.");

      return;

    }

    setEditError("");

    const updated = await onUpdateEntry(editingId, {

      date: editDate,

      amount: parsedAmount,

      notes: editNotes.trim() || undefined,

    });

    if (!updated) {
      setEditError("The trade could not be updated. Check the error above and try again.");
      return;
    }
    try {
      const savedJournal = await saveTradeJournal({
        entryId: editingId, ticker: editTicker, companyName: editCompanyName,
        strategyId: editStrategyId || null, tagIds: editTagIds, journalNotes: editJournalNotes,
      });
      setJournals(current => [...current.filter(item => item.entryId !== editingId), savedJournal]);
      setEditingId(null);
    } catch (caught) {
      setEditError(`Trade P/L was updated, but journal saving failed: ${caught instanceof Error ? caught.message : String(caught)}. You can retry Save changes.`);
    }

  }

  /*

   * =====================================================

   * ESCAPE

   * =====================================================

   */

  useEffect(() => {

    function handleEscape(

      event: KeyboardEvent,

    ) {

      if (

        event.key ===

        "Escape"

      ) {

        onClose();

      }

    }

    window.addEventListener(

      "keydown",

      handleEscape,

    );

    return () => {

      window.removeEventListener(

        "keydown",

        handleEscape,

      );

    };

  }, [onClose]);

  /*

   * =====================================================

   * SAVE

   * =====================================================

   */

  async function handleSave() {

    const trimmedAmount =

      amount.trim();

    if (!trimmedAmount) {

      setError(

        "Enter the trade P/L amount.",

      );

      return;

    }

    const amountValue =

      Number(trimmedAmount);

    if (

      !Number.isFinite(

        amountValue,

      )

    ) {

      setError(

        "Enter a valid amount.",

      );

      return;

    }

    const savedEntryId = pendingEntryId ?? await onAddEntry({

        accountId:

          account.id,

        date,

        amount:

          amountValue,

        /*

         * Currency always follows

         * the account.

         */

        currency:

          account.defaultCurrency,

        /*

         * Percentages are calculated

         * from account equity.

         *

         * We no longer manually store

         * a percentage for new trades.

         */

        percentage: null,

        notes:

          notes.trim() ||

          undefined,

      });

    if (!savedEntryId) {

      setError(

        "The trade could not be saved. Try again.",

      );

      return;

    }

    setPendingEntryId(savedEntryId);
    try {
      const savedJournal = await saveTradeJournal({
        entryId: savedEntryId, ticker, companyName, strategyId: strategyId || null,
        tagIds, journalNotes,
      });
      setJournals(current => [...current.filter(item => item.entryId !== savedEntryId), savedJournal]);
    } catch (caught) {
      setError(`Trade P/L was saved, but journal saving failed: ${caught instanceof Error ? caught.message : String(caught)}. Click Add trade to retry the journal without duplicating the trade.`);
      return;
    }
    setPendingEntryId(null);
    setAmount("");
    setNotes("");
    setTicker("");
    setCompanyName("");
    setStrategyId("");
    setTagIds([]);
    setJournalNotes("");
    setError("");

  }

  return (

    <div

      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"

      role="presentation"

      onMouseDown={(

        event,

      ) => {

        if (

          event.target ===

          event.currentTarget

        ) {

          onClose();

        }

      }}

    >

      <section

        role="dialog"

        aria-modal="true"

        aria-labelledby="daily-entry-title"

        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/[0.09] bg-[#0d100f] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.65)]"

      >

        {/* HEADER */}

        <div className="flex items-start justify-between gap-4">

          <div>

            <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-400/70">

              {account.name}

            </p>

            <h2

              id="daily-entry-title"

              className="mt-2 text-2xl font-semibold text-white"

            >

              Daily trades

            </h2>

            <p className="mt-1 text-neutral-400">

              {formatDate(

                date,

              )}

            </p>

          </div>

          <button

            type="button"

            onClick={

              onClose

            }

            className="rounded-lg border border-neutral-800 px-3 py-2 text-neutral-400 transition hover:border-neutral-600 hover:text-white"

            aria-label="Close modal"

          >

            ✕

          </button>

        </div>

        {/* EXISTING TRADES */}

        {entries.length > 0 && (

          <div className="mt-7">

            <h3 className="text-sm font-medium text-neutral-300">

              Trades

            </h3>

            <div className="mt-3 space-y-3">

              {entries.map(

                (

                  entry,

                  index,

                ) => (

                  <div

                    key={

                      entry.id

                    }

                    className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4"

                  >

                    {editingId === entry.id ? (

                      <div className="w-full space-y-3">

                        <p className="text-sm font-medium text-neutral-200">Edit trade {index + 1}</p>

                        <div className="grid gap-3 sm:grid-cols-2">

                          <label className="text-xs text-neutral-400">Date

                            <input type="date" value={editDate} onChange={event => setEditDate(event.target.value)}

                              className="mt-1 w-full rounded-lg border border-white/10 bg-[#151817] px-3 py-2 text-sm text-white" />

                          </label>

                          <label className="text-xs text-neutral-400">P/L ({account.defaultCurrency})

                            <input type="number" step="0.01" value={editAmount} onChange={event => setEditAmount(event.target.value)}

                              className="mt-1 w-full rounded-lg border border-white/10 bg-[#151817] px-3 py-2 text-sm text-white" />

                          </label>

                        </div>

                        <label className="block text-xs text-neutral-400">Notes

                          <textarea rows={2} value={editNotes} onChange={event => setEditNotes(event.target.value)}

                            className="mt-1 w-full rounded-lg border border-white/10 bg-[#151817] px-3 py-2 text-sm text-white" />

                        </label>

                                                  {JournalFields({ editing: true })}
{editError && <p className="text-sm text-red-400">{editError}</p>}

                        <div className="flex justify-end gap-2">

                          <button type="button" disabled={saving} onClick={() => { setEditingId(null); setEditError(""); }}

                            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-neutral-300">Cancel</button>

                          <button type="button" disabled={saving} onClick={() => void saveEdit()}

                            className="rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300 disabled:opacity-50">

                            {saving ? "Saving..." : "Save changes"}

                          </button>

                        </div>

                      </div>

                    ) : (

                      <>

                    <div>

                      <p className="text-xs text-neutral-500">

                        Trade{" "}

                        {index + 1}

                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-3">

                        {entry.amount !==

                          null && (

                          <span

                            className={`font-semibold ${

                              entry.amount >=

                              0

                                ? "text-emerald-400"

                                : "text-red-400"

                            }`}

                          >

                            {formatAmount(

                              entry.amount,

                            )}

                            <span className="ml-1 text-xs font-medium text-neutral-500">

                              {

                                account.defaultCurrency

                              }

                            </span>

                          </span>

                        )}

                      </div>

                      {entry.notes && (

                        <p className="mt-2 text-sm text-neutral-400">

                          {

                            entry.notes

                          }

                        </p>

                      )}

                    </div>

                    <div className="flex shrink-0 gap-2">

                    <button type="button" disabled={saving || deletingEntryId === entry.id} onClick={() => beginEdit(entry)}

                      className="rounded-lg border border-white/10 px-3 py-2 text-sm text-neutral-300 transition hover:border-white/25">Edit</button>

                    <button

                      type="button"

                      disabled={

                        deletingEntryId ===

                        entry.id

                      }

                      onClick={() =>

                        void onDeleteEntry(

                          entry.id,

                        )

                      }

                      className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"

                    >

                      {deletingEntryId ===

                      entry.id

                        ? "Deleting..."

                        : "Delete"}

                    </button>

                    </div>

                    </>)}

                  </div>

                ),

              )}

            </div>

          </div>

        )}

        {/* ADD TRADE */}

        <div className="mt-7 border-t border-white/[0.07] pt-6">

          <h3 className="font-medium text-white">

            Add trade

          </h3>

          <p className="mt-1 text-sm text-neutral-500">

            Record the realized profit or loss for this trade.

          </p>

          {/* P/L + LOCKED CURRENCY */}

          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_150px]">

            <label>

              <span className="mb-2 block text-sm text-neutral-300">

                P/L amount

              </span>

              <input

                type="number"

                step="0.01"

                value={

                  amount

                }

                onChange={(

                  event,

                ) =>

                  setAmount(

                    event.target

                      .value,

                  )

                }

                placeholder="Example: 250 or -120"

                className="h-12 w-full rounded-xl border border-white/[0.09] bg-[#151817] px-4 text-neutral-200 outline-none transition focus:border-emerald-500/40"

              />

            </label>

            <div>

              <span className="mb-2 block text-sm text-neutral-300">

                Currency

              </span>

              <div

                className="flex h-12 w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 text-neutral-400"

                title="Currency is determined by the selected account."

              >

                <span className="font-medium">

                  {

                    account.defaultCurrency

                  }

                </span>

                <svg

                  viewBox="0 0 24 24"

                  fill="none"

                  stroke="currentColor"

                  strokeWidth="1.8"

                  className="h-4 w-4 text-neutral-600"

                  aria-hidden="true"

                >

                  <rect

                    x="5"

                    y="10"

                    width="14"

                    height="10"

                    rx="2"

                  />

                  <path

                    strokeLinecap="round"

                    strokeLinejoin="round"

                    d="M8 10V7a4 4 0 018 0v3"

                  />

                </svg>

              </div>

              <p className="mt-1.5 text-[11px] text-neutral-600">

                Account currency

              </p>

            </div>

          </div>

          {/* NOTES */}

          <label className="mt-4 block">

            <span className="mb-2 block text-sm text-neutral-300">

              Notes

            </span>

            <textarea

              value={

                notes

              }

              onChange={(

                event,

              ) =>

                setNotes(

                  event.target

                    .value,

                )

              }

              placeholder="Optional note"

              rows={3}

              className="w-full resize-none rounded-xl border border-white/[0.09] bg-[#151817] px-4 py-3 text-neutral-200 outline-none transition focus:border-emerald-500/40"

            />

          </label>

                      <div className="mt-5">{JournalFields({ editing: false })}</div>
            {(journalError || journalLoading) && <p className="mt-3 text-xs text-neutral-400">{journalLoading ? "Loading journal options..." : journalError}</p>}
{error && (

            <p className="mt-3 text-sm text-red-400">

              {error}

            </p>

          )}

          {/* ACTIONS */}

          <div className="mt-6 flex justify-end gap-3">

            <button

              type="button"

              onClick={

                onClose

              }

              className="rounded-xl border border-white/[0.09] px-5 py-3 text-neutral-300 transition hover:border-white/[0.18] hover:text-white"

            >

              Close

            </button>

            <button

              type="button"

              onClick={() =>

                void handleSave()

              }

              disabled={

                saving

              }

              className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-5 py-3 font-medium text-emerald-300 transition hover:border-emerald-400/45 hover:bg-emerald-500/[0.15] disabled:cursor-not-allowed disabled:opacity-60"

            >

              {saving

                ? "Saving..."

                : "Add trade"}

            </button>

          </div>

        </div>

      </section>

    </div>

  );

}
