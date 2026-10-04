import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Session,
} from "@supabase/supabase-js";

import AccountSelector from "./components/account/AccountSelector";
import AuthForm from "./components/auth/AuthForm";
import Calendar from "./components/calendar/Calendar";
import CalendarHeader from "./components/calendar/CalendarHeader";
import Header from "./components/layout/Header";
import DailyEntryModal from "./components/modal/DailyEntryModal";
import SettingsModal from "./components/settings/SettingsModal";
import SummaryCards from "./components/summary/SummaryCards";

import { supabase } from "./lib/supabase";

import {
  createAccount,
  getAccounts,
  updateAccount,
} from "./services/accounts";

import {
  assignUnassignedEntries,
  createEntry,
  deleteEntry,
  getEntries,
} from "./services/entries";

import {
  getUserSettings,
  updateUserSettings,
} from "./services/settings";

import type {
  Account,
  CountryCode,
  CreateAccountInput,
  CurrencyCode,
  UserSettings,
} from "./types/account";

import type {
  PerformanceEntry,
} from "./types/entry";

interface AddEntryInput {
  accountId: string;

  date: string;

  amount: number;

  currency: CurrencyCode;

  percentage?: number | null;

  notes?: string;
}

function App() {
  const currentDate =
    new Date();

  /*
   * =====================================================
   * AUTH
   * =====================================================
   */

  const [
    session,
    setSession,
  ] = useState<Session | null>(
    null,
  );

  const [
    authLoading,
    setAuthLoading,
  ] = useState(true);

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  const [
    entriesLoading,
    setEntriesLoading,
  ] = useState(false);

  const [
    settingsLoading,
    setSettingsLoading,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    deletingEntryId,
    setDeletingEntryId,
  ] = useState<
    string | null
  >(null);

  const [
    migrationLoading,
    setMigrationLoading,
  ] = useState(false);

  /*
   * =====================================================
   * GENERAL STATE
   * =====================================================
   */

  const [
    error,
    setError,
  ] = useState("");

  const [
    month,
    setMonth,
  ] = useState(
    currentDate.getMonth(),
  );

  const [
    year,
    setYear,
  ] = useState(
    currentDate.getFullYear(),
  );

  const [
    entries,
    setEntries,
  ] = useState<
    PerformanceEntry[]
  >([]);

  const [
    accounts,
    setAccounts,
  ] = useState<
    Account[]
  >([]);

  const [
    userSettings,
    setUserSettings,
  ] =
    useState<UserSettings | null>(
      null,
    );

  const [
    selectedAccountId,
    setSelectedAccountId,
  ] = useState<
    string | null
  >(null);

  const [
    selectedDate,
    setSelectedDate,
  ] = useState<
    string | null
  >(null);

  const [
    settingsOpen,
    setSettingsOpen,
  ] = useState(false);

  /*
   * =====================================================
   * ACTIVE ACCOUNT
   * =====================================================
   */

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

  /*
   * =====================================================
   * ACCOUNT ENTRIES
   * =====================================================
   */

  const accountEntries =
    useMemo(
      () => {
        if (
          !selectedAccountId
        ) {
          return [];
        }

        return entries.filter(
          (entry) =>
            entry.accountId ===
            selectedAccountId,
        );
      },
      [
        entries,
        selectedAccountId,
      ],
    );

  /*
   * =====================================================
   * OLD UNASSIGNED TRADES
   * =====================================================
   */

  const unassignedEntries =
    useMemo(
      () =>
        entries.filter(
          (entry) =>
            entry.accountId ===
            null,
        ),
      [entries],
    );

  /*
   * =====================================================
   * SELECTED DATE ENTRIES
   * =====================================================
   */

  const selectedDateEntries =
    selectedDate
      ? accountEntries.filter(
          (entry) =>
            entry.date ===
            selectedDate,
        )
      : [];

  /*
   * =====================================================
   * LOAD ENTRIES
   * =====================================================
   */

  const loadEntries =
    useCallback(
      async () => {
        setEntriesLoading(
          true,
        );

        setError("");

        try {
          const storedEntries =
            await getEntries();

          setEntries(
            storedEntries,
          );
        } catch (
          caughtError
        ) {
          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : "Could not load entries.",
          );
        } finally {
          setEntriesLoading(
            false,
          );
        }
      },
      [],
    );

  /*
   * =====================================================
   * LOAD SETTINGS + ACCOUNTS
   * =====================================================
   */

  const loadSettingsAndAccounts =
    useCallback(
      async () => {
        setSettingsLoading(
          true,
        );

        try {
          const [
            storedSettings,
            storedAccounts,
          ] =
            await Promise.all([
              getUserSettings(),
              getAccounts(),
            ]);

          setUserSettings(
            storedSettings,
          );

          setAccounts(
            storedAccounts,
          );

          /*
           * Automatically select first
           * active account.
           */

          const firstActiveAccount =
            storedAccounts.find(
              (account) =>
                account.status ===
                "active",
            );

          if (
            firstActiveAccount
          ) {
            setSelectedAccountId(
              (
                currentAccountId,
              ) =>
                currentAccountId ??
                firstActiveAccount.id,
            );
          }
        } catch (
          caughtError
        ) {
          setError(
            caughtError instanceof
              Error
              ? caughtError.message
              : "Could not load settings.",
          );
        } finally {
          setSettingsLoading(
            false,
          );
        }
      },
      [],
    );

  /*
   * =====================================================
   * AUTH
   * =====================================================
   */

  useEffect(() => {
    void supabase.auth
      .getSession()
      .then(
        ({ data }) => {
          setSession(
            data.session,
          );

          setAuthLoading(
            false,
          );
        },
      );

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        (
          _event,
          nextSession,
        ) => {
          setSession(
            nextSession,
          );

          setAuthLoading(
            false,
          );

          if (
            !nextSession
          ) {
            setEntries([]);
            setAccounts([]);
            setUserSettings(
              null,
            );
            setSelectedAccountId(
              null,
            );
            setSelectedDate(
              null,
            );
            setSettingsOpen(
              false,
            );
          }
        },
      );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /*
   * =====================================================
   * LOAD USER DATA
   * =====================================================
   */

  useEffect(() => {
    if (!session) {
      return;
    }

    void loadEntries();

    void loadSettingsAndAccounts();
  }, [
    session,
    loadEntries,
    loadSettingsAndAccounts,
  ]);

  /*
   * =====================================================
   * KEEP ACTIVE ACCOUNT VALID
   * =====================================================
   */

  useEffect(() => {
    if (
      accounts.length === 0
    ) {
      setSelectedAccountId(
        null,
      );

      return;
    }

    const stillExists =
      accounts.some(
        (account) =>
          account.id ===
          selectedAccountId &&
          account.status ===
            "active",
      );

    if (!stillExists) {
      const firstActive =
        accounts.find(
          (account) =>
            account.status ===
            "active",
        );

      setSelectedAccountId(
        firstActive?.id ??
          null,
      );
    }
  }, [
    accounts,
    selectedAccountId,
  ]);

  /*
   * =====================================================
   * MONTH NAVIGATION
   * =====================================================
   */

  function handlePreviousMonth() {
    if (month === 0) {
      setMonth(11);

      setYear(
        (
          currentYear,
        ) =>
          currentYear - 1,
      );

      return;
    }

    setMonth(
      (
        currentMonth,
      ) =>
        currentMonth - 1,
    );
  }

  function handleNextMonth() {
    if (month === 11) {
      setMonth(0);

      setYear(
        (
          currentYear,
        ) =>
          currentYear + 1,
      );

      return;
    }

    setMonth(
      (
        currentMonth,
      ) =>
        currentMonth + 1,
    );
  }

  /*
   * =====================================================
   * ADD TRADE
   * =====================================================
   */

  async function handleAddEntry(
    newEntry: AddEntryInput,
  ): Promise<boolean> {
    setSaving(true);
    setError("");

    try {
      const savedEntry =
        await createEntry(
          newEntry,
        );

      setEntries(
        (
          currentEntries,
        ) => [
          ...currentEntries,
          savedEntry,
        ],
      );

      return true;
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : "Could not save the trade.",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  /*
   * =====================================================
   * DELETE TRADE
   * =====================================================
   */

  async function handleDeleteEntry(
    id: string,
  ): Promise<void> {
    setDeletingEntryId(
      id,
    );

    setError("");

    try {
      await deleteEntry(id);

      setEntries(
        (
          currentEntries,
        ) =>
          currentEntries.filter(
            (entry) =>
              entry.id !== id,
          ),
      );
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : "Could not delete the trade.",
      );
    } finally {
      setDeletingEntryId(
        null,
      );
    }
  }

  /*
   * =====================================================
   * SAVE SETTINGS
   * =====================================================
   */

  async function handleSaveSettings(
    country: CountryCode,
    currency: CurrencyCode,
  ): Promise<void> {
    const savedSettings =
      await updateUserSettings(
        country,
        currency,
      );

    setUserSettings(
      savedSettings,
    );
  }

  /*
   * =====================================================
   * CREATE ACCOUNT
   * =====================================================
   */

  async function handleCreateAccount(
    input: CreateAccountInput,
  ): Promise<void> {
    const savedAccount =
      await createAccount(
        input,
      );

    setAccounts(
      (
        currentAccounts,
      ) => [
        ...currentAccounts,
        savedAccount,
      ],
    );

    /*
     * If this is the user's first account,
     * make it active immediately.
     */

    setSelectedAccountId(
      (
        currentAccountId,
      ) =>
        currentAccountId ??
        savedAccount.id,
    );
  }

  /*
   * =====================================================
   * UPDATE ACCOUNT
   * =====================================================
   */

  async function handleUpdateAccount(
    account: Account,
  ): Promise<void> {
    const savedAccount =
      await updateAccount(
        account,
      );

    setAccounts(
      (
        currentAccounts,
      ) =>
        currentAccounts.map(
          (
            currentAccount,
          ) =>
            currentAccount.id ===
            savedAccount.id
              ? savedAccount
              : currentAccount,
        ),
    );
  }

  /*
   * =====================================================
   * ASSIGN OLD TRADES
   * =====================================================
   */

  async function handleAssignOldTrades() {
    if (!selectedAccount) {
      return;
    }

    setMigrationLoading(
      true,
    );

    setError("");

    try {
      await assignUnassignedEntries(
        selectedAccount.id,
        selectedAccount.defaultCurrency,
      );

      await loadEntries();
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : "Could not assign old trades.",
      );
    } finally {
      setMigrationLoading(
        false,
      );
    }
  }

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
        Loading...
      </main>
    );
  }

  /*
   * =====================================================
   * LOGIN
   * =====================================================
   */

  if (!session) {
    return <AuthForm />;
  }

  /*
   * =====================================================
   * DASHBOARD
   * =====================================================
   */

  return (
    <main className="relative min-h-screen bg-[#080a09] px-4 py-8 text-white sm:px-8">

      {/* BACKGROUND */}

      <div
        className="pointer-events-none fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/dashboard-background.png')",
        }}
      />

      <div className="pointer-events-none fixed inset-0 bg-black/15" />

      {/* DASHBOARD */}

      <div className="relative z-10 mx-auto max-w-7xl">

        <Header
          onOpenSettings={() =>
            setSettingsOpen(
              true,
            )
          }
        />

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur-md">
            {error}
          </div>
        )}

        {/* ACCOUNT SELECTOR */}

        <AccountSelector
          accounts={accounts.filter(
            (account) =>
              account.status ===
              "active",
          )}
          selectedAccountId={
            selectedAccountId
          }
          onAccountChange={(
            accountId,
          ) => {
            setSelectedAccountId(
              accountId,
            );

            setSelectedDate(
              null,
            );
          }}
          onOpenSettings={() =>
            setSettingsOpen(
              true,
            )
          }
        />

        {/* OLD TRADE MIGRATION */}

        {unassignedEntries.length >
          0 &&
          selectedAccount && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] px-5 py-4 backdrop-blur-md">

              <div>
                <p className="text-sm font-medium text-amber-200">
                  {
                    unassignedEntries.length
                  }{" "}
                  older{" "}
                  {unassignedEntries.length ===
                  1
                    ? "trade"
                    : "trades"}{" "}
                  need an account.
                </p>

                <p className="mt-1 text-xs text-neutral-400">
                  Assign them to{" "}
                  <span className="font-medium text-neutral-200">
                    {
                      selectedAccount.name
                    }
                  </span>{" "}
                  using{" "}
                  {
                    selectedAccount.defaultCurrency
                  }{" "}
                  as their currency.
                </p>
              </div>

              <button
                type="button"
                disabled={
                  migrationLoading
                }
                onClick={() =>
                  void handleAssignOldTrades()
                }
                className="rounded-xl border border-amber-400/25 bg-amber-500/[0.08] px-4 py-2.5 text-sm font-medium text-amber-200 transition hover:border-amber-400/45 hover:bg-amber-500/[0.13] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {migrationLoading
                  ? "Assigning..."
                  : `Assign to ${selectedAccount.name}`}
              </button>

            </div>
          )}

        {/* ACCOUNT CONTENT */}

        {selectedAccount ? (
          <>
            <SummaryCards
              entries={
                accountEntries
              }
              month={month}
              year={year}
            />

            <CalendarHeader
              month={month}
              year={year}
              onPreviousMonth={
                handlePreviousMonth
              }
              onNextMonth={
                handleNextMonth
              }
              onMonthChange={
                setMonth
              }
              onYearChange={
                setYear
              }
            />

            {entriesLoading ? (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-10 text-center text-neutral-400 backdrop-blur-sm">
                Loading your trades...
              </div>
            ) : (
              <Calendar
                year={year}
                month={month}
                entries={
                  accountEntries
                }
                onDayClick={
                  setSelectedDate
                }
              />
            )}
          </>
        ) : (
          !settingsLoading && (
            <div className="rounded-2xl border border-white/[0.07] bg-black/30 p-10 text-center backdrop-blur-md">

              <h2 className="text-lg font-medium text-white">
                No account selected
              </h2>

              <p className="mt-2 text-sm text-neutral-500">
                Create an account in Settings to start tracking performance.
              </p>

              <button
                type="button"
                onClick={() =>
                  setSettingsOpen(
                    true,
                  )
                }
                className="mt-5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-5 py-2.5 text-sm font-medium text-emerald-300 transition hover:border-emerald-400/45"
              >
                Open Settings
              </button>

            </div>
          )
        )}

      </div>

      {/* DAILY TRADE MODAL */}

      {selectedDate &&
        selectedAccount && (
          <DailyEntryModal
            date={
              selectedDate
            }
            entries={
              selectedDateEntries
            }
            account={
              selectedAccount
            }
            saving={
              saving
            }
            deletingEntryId={
              deletingEntryId
            }
            onClose={() =>
              setSelectedDate(
                null,
              )
            }
            onAddEntry={
              handleAddEntry
            }
            onDeleteEntry={
              handleDeleteEntry
            }
          />
        )}

      {/* SETTINGS */}

      {settingsOpen &&
        userSettings && (
          <SettingsModal
            settings={
              userSettings
            }
            accounts={
              accounts
            }
            onClose={() =>
              setSettingsOpen(
                false,
              )
            }
            onSaveSettings={
              handleSaveSettings
            }
            onCreateAccount={
              handleCreateAccount
            }
            onUpdateAccount={
              handleUpdateAccount
            }
          />
        )}

      {/* SETTINGS LOADING */}

      {settingsOpen &&
        settingsLoading &&
        !userSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 text-neutral-400 backdrop-blur-sm">
            Loading settings...
          </div>
        )}

    </main>
  );
}

export default App;