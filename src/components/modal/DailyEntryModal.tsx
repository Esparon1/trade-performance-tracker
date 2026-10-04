import {
  useEffect,
  useState,
} from "react";

import type {
  Account,
  CurrencyCode,
} from "../../types/account";

import type {
  PerformanceEntry,
} from "../../types/entry";

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
  ) => Promise<boolean>;

  onDeleteEntry: (
    id: string,
  ) => Promise<void>;
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
}: DailyEntryModalProps) {
  const [amount, setAmount] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [error, setError] =
    useState("");

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

    const wasSaved =
      await onAddEntry({
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

    if (!wasSaved) {
      setError(
        "The trade could not be saved. Try again.",
      );

      return;
    }

    setAmount("");

    setNotes("");

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