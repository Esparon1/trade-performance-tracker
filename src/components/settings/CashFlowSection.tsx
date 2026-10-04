import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Account,
} from "../../types/account";

import type {
  CashFlow,
  CashFlowType,
  CreateCashFlowInput,
} from "../../types/cashFlow";

interface CashFlowSectionProps {
  accounts: Account[];

  cashFlows: CashFlow[];

  onAddCashFlow: (
    input: CreateCashFlowInput,
  ) => Promise<boolean>;

  onDeleteCashFlow: (
    id: string,
  ) => Promise<void>;
}

function formatMoney(
  value: number,
): string {
  return new Intl.NumberFormat(
    "en-CA",
    {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    },
  )
    .format(value)
    .replace("CA", "");
}

function formatDate(
  date: string,
): string {
  const [
    year,
    month,
    day,
  ] = date
    .split("-")
    .map(Number);

  const localDate = new Date(
    year,
    month - 1,
    day,
  );

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  ).format(localDate);
}

function getToday(): string {
  const now = new Date();

  const year =
    now.getFullYear();

  const month = String(
    now.getMonth() + 1,
  ).padStart(
    2,
    "0",
  );

  const day = String(
    now.getDate(),
  ).padStart(
    2,
    "0",
  );

  return `${year}-${month}-${day}`;
}

const STARTING_CAPITAL_NOTICE_KEY =
  "cash-flow-starting-capital-notice-dismissed";

export default function CashFlowSection({
  accounts,
  cashFlows,
  onAddCashFlow,
  onDeleteCashFlow,
}: CashFlowSectionProps) {
  const activeAccounts =
    useMemo(
      () =>
        accounts.filter(
          (account) =>
            account.status ===
            "active",
        ),
      [accounts],
    );

  const [
    selectedAccountId,
    setSelectedAccountId,
  ] = useState<string>(
    activeAccounts[0]?.id ??
      accounts[0]?.id ??
      "",
  );

  const [
    addModalOpen,
    setAddModalOpen,
  ] = useState(false);

  const [
    flowType,
    setFlowType,
  ] =
    useState<CashFlowType>(
      "deposit",
    );

  const [
    amount,
    setAmount,
  ] = useState("");

  const [
    date,
    setDate,
  ] = useState(
    getToday(),
  );

  const [
    notes,
    setNotes,
  ] = useState("");

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState<
    string | null
  >(null);

  const [
    startingCapitalNoticeVisible,
    setStartingCapitalNoticeVisible,
  ] = useState(
    () =>
      localStorage.getItem(
        STARTING_CAPITAL_NOTICE_KEY,
      ) !== "true",
  );

  useEffect(() => {
    const selectedExists =
      accounts.some(
        (account) =>
          account.id ===
          selectedAccountId,
      );

    if (selectedExists) {
      return;
    }

    setSelectedAccountId(
      activeAccounts[0]?.id ??
        accounts[0]?.id ??
        "",
    );
  }, [
    accounts,
    activeAccounts,
    selectedAccountId,
  ]);

  const selectedAccount =
    useMemo(
      () =>
        accounts.find(
          (account) =>
            account.id ===
            selectedAccountId,
        ) ?? null,
      [
        accounts,
        selectedAccountId,
      ],
    );

  const accountCashFlows =
    useMemo(() => {
      return cashFlows
        .filter(
          (cashFlow) =>
            cashFlow.accountId ===
            selectedAccountId,
        )
        .sort((a, b) => {
          const dateComparison =
            b.date.localeCompare(
              a.date,
            );

          if (
            dateComparison !== 0
          ) {
            return dateComparison;
          }

          return (
            b.createdAt ?? ""
          ).localeCompare(
            a.createdAt ?? "",
          );
        });
    }, [
      cashFlows,
      selectedAccountId,
    ]);

  const totals =
    useMemo(() => {
      let deposits = 0;
      let withdrawals = 0;

      accountCashFlows.forEach(
        (cashFlow) => {
          if (
            cashFlow.type ===
            "deposit"
          ) {
            deposits +=
              cashFlow.amount;
          } else {
            withdrawals +=
              cashFlow.amount;
          }
        },
      );

      return {
        deposits,
        withdrawals,
        net:
          deposits -
          withdrawals,
      };
    }, [accountCashFlows]);

  function dismissStartingCapitalNotice() {
    localStorage.setItem(
      STARTING_CAPITAL_NOTICE_KEY,
      "true",
    );

    setStartingCapitalNoticeVisible(
      false,
    );
  }

  function resetForm() {
    setFlowType(
      "deposit",
    );

    setAmount("");

    setDate(
      getToday(),
    );

    setNotes("");

    setFormError("");
  }

  function openAddModal() {
    if (!selectedAccount) {
      return;
    }

    resetForm();

    setAddModalOpen(
      true,
    );
  }

  function closeAddModal() {
    if (isSaving) {
      return;
    }

    setAddModalOpen(
      false,
    );

    resetForm();
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedAccount) {
      setFormError(
        "Select an account first.",
      );

      return;
    }

    const parsedAmount =
      Number(amount);

    if (
      !Number.isFinite(
        parsedAmount,
      ) ||
      parsedAmount <= 0
    ) {
      setFormError(
        "Enter an amount greater than 0.",
      );

      return;
    }

    if (!date) {
      setFormError(
        "Select a date.",
      );

      return;
    }

    if (
      selectedAccount.startingDate &&
      date <
        selectedAccount.startingDate
    ) {
      setFormError(
        `Cash flow cannot be before the account starting date (${selectedAccount.startingDate}).`,
      );

      return;
    }

    setFormError("");

    setIsSaving(
      true,
    );

    try {
      const success =
        await onAddCashFlow(
          {
            accountId:
              selectedAccount.id,

            date,

            type: flowType,

            amount:
              parsedAmount,

            currency:
              selectedAccount.defaultCurrency,

            notes:
              notes.trim() ||
              undefined,
          },
        );

      if (!success) {
        setFormError(
          "Could not add the cash flow. Please try again.",
        );

        return;
      }

      setAddModalOpen(
        false,
      );

      resetForm();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not add the cash flow.",
      );
    } finally {
      setIsSaving(
        false,
      );
    }
  }

  async function handleDelete(
    cashFlow: CashFlow,
  ) {
    const confirmed =
      window.confirm(
        `Delete this ${cashFlow.type} of ${formatMoney(
          cashFlow.amount,
        )} ${cashFlow.currency}?`,
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(
      cashFlow.id,
    );

    try {
      await onDeleteCashFlow(
        cashFlow.id,
      );
    } finally {
      setDeletingId(
        null,
      );
    }
  }

  if (
    accounts.length === 0
  ) {
    return (
      <section>
        <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-6">
          <h2 className="text-lg font-semibold text-white">
            Cash Flow
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
            Create an account
            before adding
            deposits or
            withdrawals.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section>
        {/* HEADER */}

        <div className="flex flex-col gap-5 border-b border-white/[0.07] pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
              Account funding
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
              Cash Flow
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
              Track deposits
              and withdrawals
              separately from
              trading profit and
              loss.
            </p>
          </div>

          <button
            type="button"
            onClick={
              openAddModal
            }
            disabled={
              !selectedAccount
            }
            className="mr-10 inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 text-sm font-semibold text-emerald-300 transition hover:border-emerald-400/50 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                d="M12 5v14M5 12h14"
                strokeLinecap="round"
              />
            </svg>

            Add Cash Flow
          </button>
        </div>

        {/* ACCOUNT */}

        <div className="mt-6">
          <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
            Account
          </label>

          <select
            value={
              selectedAccountId
            }
            onChange={(
              event,
            ) =>
              setSelectedAccountId(
                event.target
                  .value,
              )
            }
            className="h-11 w-full max-w-md rounded-xl border border-white/[0.08] bg-[#0d100f] px-3 text-sm text-neutral-200 outline-none transition focus:border-emerald-500/40"
          >
            {accounts.map(
              (account) => (
                <option
                  key={
                    account.id
                  }
                  value={
                    account.id
                  }
                >
                  {
                    account.name
                  }
                  {account.status ===
                  "archived"
                    ? " — Archived"
                    : ""}
                </option>
              ),
            )}
          </select>

          {selectedAccount && (
            <p className="mt-2 text-xs text-neutral-600">
              {
                selectedAccount.defaultCurrency
              }{" "}
              account
              {selectedAccount.startingDate
                ? ` · Started ${formatDate(
                    selectedAccount.startingDate,
                  )}`
                : ""}
            </p>
          )}
        </div>

        {/* STARTING CAPITAL WARNING */}

        {startingCapitalNoticeVisible &&
          selectedAccount?.startingCapital !==
            null &&
          selectedAccount?.startingCapital !==
            undefined && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-500/15 bg-amber-500/[0.05] p-4">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-300">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />

                  <path
                    d="M12 10v6"
                    strokeLinecap="round"
                  />

                  <path
                    d="M12 7h.01"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-neutral-300">
                  Starting capital is
                  already your opening
                  balance.
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  Do not add your
                  starting capital again
                  as a deposit. Only
                  record money added or
                  removed after the
                  account begins.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  dismissStartingCapitalNotice
                }
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-white/[0.05] hover:text-neutral-300"
                aria-label="Dismiss starting capital notice"
                title="Don't show this again"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          )}

        {/* SUMMARY */}

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <SummaryBox
            label="Total Deposits"
            value={
              totals.deposits
            }
            tone="positive"
            currency={
              selectedAccount?.defaultCurrency ??
              "CAD"
            }
          />

          <SummaryBox
            label="Total Withdrawals"
            value={
              totals.withdrawals
            }
            tone="negative"
            currency={
              selectedAccount?.defaultCurrency ??
              "CAD"
            }
          />

          <SummaryBox
            label="Net Cash Flow"
            value={
              totals.net
            }
            tone={
              totals.net > 0
                ? "positive"
                : totals.net <
                    0
                  ? "negative"
                  : "neutral"
            }
            signed
            currency={
              selectedAccount?.defaultCurrency ??
              "CAD"
            }
          />
        </div>

        {/* HISTORY */}

        <div className="mt-7 overflow-hidden rounded-2xl border border-white/[0.08] bg-black/20">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-neutral-200">
                Cash Flow
                History
              </h3>

              <p className="mt-1 text-xs text-neutral-600">
                Newest first ·
                deposits and
                withdrawals are
                permanent account
                records
              </p>
            </div>

            <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1 text-xs text-neutral-500">
              {
                accountCashFlows.length
              }{" "}
              {accountCashFlows.length ===
              1
                ? "record"
                : "records"}
            </div>
          </div>

          {accountCashFlows.length ===
          0 ? (
            <div className="px-6 py-14 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-neutral-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12h14"
                    strokeLinecap="round"
                  />

                  <path
                    d="M12 5v14"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <p className="mt-4 text-sm font-medium text-neutral-400">
                No cash flow
                records yet
              </p>

              <p className="mt-1 text-xs text-neutral-600">
                Add a deposit or
                withdrawal when
                money enters or
                leaves this
                account.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] text-left">
                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.1em] text-neutral-600">
                      Date
                    </th>

                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.1em] text-neutral-600">
                      Type
                    </th>

                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.1em] text-neutral-600">
                      Amount
                    </th>

                    <th className="px-5 py-3 text-xs font-medium uppercase tracking-[0.1em] text-neutral-600">
                      Notes
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-[0.1em] text-neutral-600">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {accountCashFlows.map(
                    (
                      cashFlow,
                    ) => {
                      const isDeposit =
                        cashFlow.type ===
                        "deposit";

                      return (
                        <tr
                          key={
                            cashFlow.id
                          }
                          className="border-b border-white/[0.05] last:border-b-0 hover:bg-white/[0.02]"
                        >
                          <td className="whitespace-nowrap px-5 py-4 text-sm text-neutral-300">
                            {formatDate(
                              cashFlow.date,
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${
                                isDeposit
                                  ? "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400"
                                  : "border-red-500/20 bg-red-500/[0.08] text-red-400"
                              }`}
                            >
                              <span>
                                {isDeposit
                                  ? "+"
                                  : "−"}
                              </span>

                              {isDeposit
                                ? "Deposit"
                                : "Withdrawal"}
                            </span>
                          </td>

                          <td
                            className={`whitespace-nowrap px-5 py-4 text-sm font-semibold ${
                              isDeposit
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {isDeposit
                              ? "+"
                              : "−"}
                            {formatMoney(
                              cashFlow.amount,
                            )}{" "}
                            <span className="ml-1 text-xs font-medium text-neutral-600">
                              {
                                cashFlow.currency
                              }
                            </span>
                          </td>

                          <td className="max-w-[280px] px-5 py-4 text-sm text-neutral-500">
                            {cashFlow.notes ||
                              "—"}
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  cashFlow,
                                )
                              }
                              disabled={
                                deletingId ===
                                cashFlow.id
                              }
                              className="inline-flex h-8 items-center justify-center rounded-lg border border-red-500/15 bg-red-500/[0.05] px-3 text-xs font-medium text-red-400 transition hover:border-red-500/30 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {deletingId ===
                              cashFlow.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ADD CASH FLOW MODAL */}

      {addModalOpen &&
        selectedAccount && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
            <button
              type="button"
              aria-label="Close cash flow modal"
              onClick={
                closeAddModal
              }
              className="absolute inset-0 cursor-default"
            />

            <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d100f] shadow-[0_30px_100px_rgba(0,0,0,0.65)]">
              <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-6 py-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
                    Account
                    funding
                  </p>

                  <h3 className="mt-1.5 text-xl font-semibold text-white">
                    Add Cash Flow
                  </h3>

                  <p className="mt-1 text-sm text-neutral-500">
                    {
                      selectedAccount.name
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeAddModal
                  }
                  disabled={
                    isSaving
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-neutral-500 transition hover:bg-white/[0.06] hover:text-neutral-300 disabled:opacity-40"
                  aria-label="Close"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <form
                onSubmit={
                  handleSubmit
                }
                className="p-6"
              >
                {/* TYPE */}

                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                    Type
                  </label>

                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/[0.07] bg-black/20 p-1">
                    <button
                      type="button"
                      onClick={() =>
                        setFlowType(
                          "deposit",
                        )
                      }
                      className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                        flowType ===
                        "deposit"
                          ? "bg-emerald-500/15 text-emerald-300 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.22)]"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      + Deposit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFlowType(
                          "withdrawal",
                        )
                      }
                      className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                        flowType ===
                        "withdrawal"
                          ? "bg-red-500/15 text-red-300 shadow-[inset_0_0_0_1px_rgba(239,68,68,0.22)]"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      − Withdrawal
                    </button>
                  </div>
                </div>

                {/* AMOUNT + CURRENCY */}

                <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_120px]">
                  <div>
                    <label
                      htmlFor="cash-flow-amount"
                      className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-neutral-500"
                    >
                      Amount
                    </label>

                    <input
                      id="cash-flow-amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      inputMode="decimal"
                      value={
                        amount
                      }
                      onChange={(
                        event,
                      ) =>
                        setAmount(
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="5000"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-neutral-500">
                      Currency
                    </label>

                    <div className="flex h-11 items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 text-sm text-neutral-400">
                      <span>
                        {
                          selectedAccount.defaultCurrency
                        }
                      </span>

                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="h-3.5 w-3.5 text-neutral-600"
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
                          d="M8 10V7a4 4 0 018 0v3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* DATE */}

                <div className="mt-5">
                  <label
                    htmlFor="cash-flow-date"
                    className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-neutral-500"
                  >
                    Date
                  </label>

                  <input
                    id="cash-flow-date"
                    type="date"
                    value={date}
                    min={
                      selectedAccount.startingDate ??
                      undefined
                    }
                    onChange={(
                      event,
                    ) =>
                      setDate(
                        event
                          .target
                          .value,
                      )
                    }
                    className={inputClass}
                  />

                  {selectedAccount.startingDate && (
                    <p className="mt-2 text-xs text-neutral-600">
                      Account
                      calculations
                      begin on{" "}
                      {formatDate(
                        selectedAccount.startingDate,
                      )}
                      .
                    </p>
                  )}
                </div>

                {/* NOTES */}

                <div className="mt-5">
                  <label
                    htmlFor="cash-flow-notes"
                    className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-neutral-500"
                  >
                    Notes{" "}
                    <span className="normal-case tracking-normal text-neutral-700">
                      (optional)
                    </span>
                  </label>

                  <textarea
                    id="cash-flow-notes"
                    value={
                      notes
                    }
                    onChange={(
                      event,
                    ) =>
                      setNotes(
                        event
                          .target
                          .value,
                      )
                    }
                    rows={3}
                    placeholder="Example: Additional account funding"
                    className={`${inputClass} h-auto resize-none py-3`}
                  />
                </div>

                {formError && (
                  <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300">
                    {
                      formError
                    }
                  </div>
                )}

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={
                      closeAddModal
                    }
                    disabled={
                      isSaving
                    }
                    className="h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 text-sm font-semibold text-neutral-400 transition hover:bg-white/[0.06] hover:text-neutral-200 disabled:opacity-40"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      isSaving
                    }
                    className={`h-11 rounded-xl border px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      flowType ===
                      "deposit"
                        ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/20"
                        : "border-red-500/30 bg-red-500/15 text-red-300 hover:bg-red-500/20"
                    }`}
                  >
                    {isSaving
                      ? "Adding..."
                      : flowType ===
                          "deposit"
                        ? "Add Deposit"
                        : "Add Withdrawal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </>
  );
}

interface SummaryBoxProps {
  label: string;

  value: number;

  tone:
    | "positive"
    | "negative"
    | "neutral";

  signed?: boolean;

  currency: string;
}

function SummaryBox({
  label,
  value,
  tone,
  signed = false,
  currency,
}: SummaryBoxProps) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-400"
      : tone ===
          "negative"
        ? "text-red-400"
        : "text-neutral-300";

  let sign = "";

  if (signed) {
    if (value > 0) {
      sign = "+";
    } else if (value < 0) {
      sign = "−";
    }
  }

  const displayValue =
    signed
      ? Math.abs(value)
      : value;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101312]/80 p-4">
      <div
        className={`absolute left-0 top-0 h-full w-[2px] ${
          tone ===
          "positive"
            ? "bg-emerald-400"
            : tone ===
                "negative"
              ? "bg-red-400"
              : "bg-neutral-600"
        }`}
      />

      <p className="text-xs font-medium uppercase tracking-[0.1em] text-neutral-600">
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-semibold tracking-tight ${toneClass}`}
      >
        {sign}
        {formatMoney(
          displayValue,
        )}
      </p>

      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-700">
        {currency}
      </p>
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-white/[0.08] bg-[#090c0b] px-3 text-sm text-neutral-200 outline-none transition placeholder:text-neutral-700 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/10";