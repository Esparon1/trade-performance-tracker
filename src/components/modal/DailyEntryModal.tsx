import { useEffect, useState } from "react";

import type { PerformanceEntry } from "../../types/entry";

import { calculateDailyTotals } from "../../utils/calendar";

import {
  formatAmount,
  formatDate,
  formatPercentage,
} from "../../utils/format";

interface DailyEntryModalProps {
  date: string;
  entries: PerformanceEntry[];
  onClose: () => void;
  onAddEntry: (
    entry: Omit<PerformanceEntry, "id">,
  ) => void;
  onDeleteEntry: (id: string) => void;
}

export default function DailyEntryModal({
  date,
  entries,
  onClose,
  onAddEntry,
  onDeleteEntry,
}: DailyEntryModalProps) {
  const [percentage, setPercentage] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const totals = calculateDailyTotals(entries);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [onClose]);

  function handleSave() {
    const trimmedPercentage = percentage.trim();
    const trimmedAmount = amount.trim();

    if (!trimmedPercentage && !trimmedAmount) {
      setError(
        "Enter a percentage, an amount, or both.",
      );
      return;
    }

    const percentageValue = trimmedPercentage
      ? Number(trimmedPercentage)
      : null;

    const amountValue = trimmedAmount
      ? Number(trimmedAmount)
      : null;

    if (
      percentageValue !== null &&
      !Number.isFinite(percentageValue)
    ) {
      setError("Enter a valid percentage.");
      return;
    }

    if (
      amountValue !== null &&
      !Number.isFinite(amountValue)
    ) {
      setError("Enter a valid amount.");
      return;
    }

    onAddEntry({
      date,
      percentage: percentageValue,
      amount: amountValue,
      notes: notes.trim() || undefined,
    });

    setPercentage("");
    setAmount("");
    setNotes("");
    setError("");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="daily-entry-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="daily-entry-title"
              className="text-2xl font-semibold"
            >
              Daily entries
            </h2>

            <p className="mt-1 text-neutral-400">
              {formatDate(date)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-neutral-800 px-3 py-2 text-neutral-400 hover:border-neutral-600 hover:text-white"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <p className="text-sm text-neutral-400">
              Daily percentage
            </p>

            <p
              className={`mt-2 text-xl font-semibold ${
                totals.percentage >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {formatPercentage(totals.percentage)}
            </p>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
            <p className="text-sm text-neutral-400">
              Daily amount
            </p>

            <p
              className={`mt-2 text-xl font-semibold ${
                totals.amount >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {formatAmount(totals.amount)}
            </p>
          </div>
        </div>

        {entries.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium">
              Existing entries
            </h3>

            <div className="mt-3 space-y-3">
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-900 p-4"
                >
                  <div>
                    <p className="text-sm text-neutral-400">
                      Entry {index + 1}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-3">
                      {entry.percentage !== null && (
                        <span
                          className={
                            entry.percentage >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {formatPercentage(
                            entry.percentage,
                          )}
                        </span>
                      )}

                      {entry.amount !== null && (
                        <span
                          className={
                            entry.amount >= 0
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {formatAmount(entry.amount)}
                        </span>
                      )}
                    </div>

                    {entry.notes && (
                      <p className="mt-2 text-sm text-neutral-400">
                        {entry.notes}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onDeleteEntry(entry.id)
                    }
                    className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-7 border-t border-neutral-800 pt-6">
          <h3 className="font-medium">
            Add another entry
          </h3>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm text-neutral-300">
                Percentage
              </span>

              <input
                type="number"
                step="0.1"
                value={percentage}
                onChange={(event) =>
                  setPercentage(event.target.value)
                }
                placeholder="Example: 1.2 or -0.5"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 outline-none focus:border-neutral-500"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-neutral-300">
                Amount
              </span>

              <input
                type="number"
                step="1"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                placeholder="Example: 2000 or -450"
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 outline-none focus:border-neutral-500"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm text-neutral-300">
              Notes
            </span>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              placeholder="Optional note"
              rows={3}
              className="w-full resize-none rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 outline-none focus:border-neutral-500"
            />
          </label>

          {error && (
            <p className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-800 px-5 py-3 hover:border-neutral-600"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-white px-5 py-3 font-medium text-black hover:bg-neutral-200"
            >
              Add entry
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}