import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import AccountSelector from "./components/account/AccountSelector";
import LegacyTradesBanner from "./components/dashboard/LegacyTradesBanner";
import DashboardAccountContent from "./components/dashboard/DashboardAccountContent";
import DashboardViewSwitch, { type DashboardView } from "./components/dashboard/DashboardViewSwitch";
import AuthForm from "./components/auth/AuthForm";
import Header from "./components/layout/Header";
import DailyEntryModal from "./components/modal/DailyEntryModal";
import SettingsModal from "./components/settings/SettingsModal";
import { supabase } from "./lib/supabase";
import { useAccounts } from "./hooks/useAccounts";
import { useTrades } from "./hooks/useTrades";
import { useCashFlows } from "./hooks/useCashFlows";
import { useCalendarNavigation } from "./hooks/useCalendarNavigation";

function App() {

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

   * GENERAL STATE

   * =====================================================

   */

  const [

    error,

    setError,

  ] = useState("");

  const {
    accounts, setAccounts, userSettings, setUserSettings, selectedAccountId,
    setSelectedAccountId, selectedAccount, settingsLoading, loadSettingsAndAccounts,
    handleSaveSettings, handleCreateAccount, handleUpdateAccount,
  } = useAccounts(setError);
  const {
    entries, setEntries, entriesLoading, saving, deletingEntryId, migrationLoading,
    loadEntries, handleAddEntry, handleDeleteEntry, handleAssignOldTrades,
  } = useTrades(setError);
  const {
    cashFlows, setCashFlows, cashFlowsLoading, loadCashFlows,
    handleAddCashFlow, handleDeleteCashFlow,
  } = useCashFlows(setError, accounts);

  const { month, year, setMonth, setYear, handlePreviousMonth, handleNextMonth } = useCalendarNavigation();







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

  const [

    dashboardView,

    setDashboardView,

  ] = useState<DashboardView>(

    "calendar",

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

   * ACCOUNT CASH FLOWS

   * =====================================================

   */

  const accountCashFlows =

    useMemo(

      () => {

        if (

          !selectedAccountId

        ) {

          return [];

        }

        return cashFlows.filter(

          (cashFlow) =>

            cashFlow.accountId ===

            selectedAccountId,

        );

      },

      [

        cashFlows,

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

            setCashFlows([]);

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

    void loadCashFlows();

    void loadSettingsAndAccounts();

  }, [

    session,

    loadEntries,

    loadCashFlows,

    loadSettingsAndAccounts,

  ]);

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

        <LegacyTradesBanner

          count={unassignedEntries.length}

          account={selectedAccount}

          loading={migrationLoading}

          onAssign={() => void handleAssignOldTrades(selectedAccount)}

        />

        {selectedAccount && (

          <DashboardViewSwitch selected={dashboardView} onChange={setDashboardView} />

        )}

        <DashboardAccountContent

          selectedAccount={selectedAccount}

          dashboardView={dashboardView}

          accountEntries={accountEntries}

          accountCashFlows={accountCashFlows}

          cashFlowsLoading={cashFlowsLoading}

          entriesLoading={entriesLoading}

          settingsLoading={settingsLoading}

          month={month}

          year={year}

          onPreviousMonth={handlePreviousMonth}

          onNextMonth={handleNextMonth}

          onMonthChange={setMonth}

          onYearChange={setYear}

          onDayClick={setSelectedDate}

          onOpenSettings={() => setSettingsOpen(true)}

        />

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

            cashFlows={

              cashFlows

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

            onAddCashFlow={

              handleAddCashFlow

            }

            onDeleteCashFlow={

              handleDeleteCashFlow

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