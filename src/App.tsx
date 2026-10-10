import { useCallback, useEffect, useMemo, useState } from "react";
import AccountSelector from "./components/account/AccountSelector";
import LegacyTradesBanner from "./components/dashboard/LegacyTradesBanner";
import DashboardAccountContent from "./components/dashboard/DashboardAccountContent";
import DashboardViewSwitch, { type DashboardView } from "./components/dashboard/DashboardViewSwitch";
import AuthForm from "./components/auth/AuthForm";
import Header from "./components/layout/Header";
import DailyEntryModal from "./components/modal/DailyEntryModal";
import SettingsModal from "./components/settings/SettingsModal";
import { useAccounts } from "./hooks/useAccounts";
import { useTrades } from "./hooks/useTrades";
import { useCashFlows } from "./hooks/useCashFlows";
import { useCalendarNavigation } from "./hooks/useCalendarNavigation";
import { useAuth } from "./hooks/useAuth";
import type { PerformanceEntry } from "./types/entry";

function App() {
  const [error, setError] = useState("");
  const {
    accounts, setAccounts, userSettings, setUserSettings, selectedAccountId,
    setSelectedAccountId, selectedAccount, settingsLoading, loadSettingsAndAccounts,
    handleSaveSettings, handleCreateAccount, handleUpdateAccount,
  } = useAccounts(setError);
  const {
    entries, setEntries, entriesLoading, saving, deletingEntryId, migrationLoading,
    loadEntries, handleAddEntry, handleUpdateEntry, handleDeleteEntry, handleAssignOldTrades,
  } = useTrades(setError);
  const {
    cashFlows, setCashFlows, cashFlowsLoading, loadCashFlows,
    handleAddCashFlow, handleDeleteCashFlow,
  } = useCashFlows(setError, accounts);
  const { month, year, setMonth, setYear, handlePreviousMonth, handleNextMonth } = useCalendarNavigation();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dashboardView, setDashboardView] = useState<DashboardView>("calendar");
  const [journalRefreshToken, setJournalRefreshToken] = useState(0);
  const accountEntries = useMemo(() => {
    if (!selectedAccountId) return [];
    return entries.filter(entry => entry.accountId === selectedAccountId);
  }, [entries, selectedAccountId]);
  const accountCashFlows = useMemo(() => {
    if (!selectedAccountId) return [];
    return cashFlows.filter(cashFlow => cashFlow.accountId === selectedAccountId);
  }, [cashFlows, selectedAccountId]);
  const unassignedEntries = useMemo(() => entries.filter(entry => entry.accountId === null), [entries]);
  const selectedDateEntries = selectedDate ? accountEntries.filter(entry => entry.date === selectedDate) : [];
  const clearUserData = useCallback(() => {
    setEntries([]);
    setCashFlows([]);
    setAccounts([]);
    setUserSettings(null);
    setSelectedAccountId(null);
    setSelectedDate(null);
    setSettingsOpen(false);
    setJournalRefreshToken(0);
  }, [setEntries, setCashFlows, setAccounts, setUserSettings, setSelectedAccountId]);
  const { session, authLoading } = useAuth(clearUserData);
  useEffect(() => {
    if (!session) return;
    void loadEntries();
    void loadCashFlows();
    void loadSettingsAndAccounts();
  }, [session, loadEntries, loadCashFlows, loadSettingsAndAccounts]);
  function openJournalTrade(entry: PerformanceEntry) {
    if (!entry.accountId) return;
    setSelectedAccountId(entry.accountId);
    setSelectedDate(entry.date);
  }
  function closeTradeModal() {
    setSelectedDate(null);
    setJournalRefreshToken(value => value + 1);
  }
  if (authLoading) return <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">Loading...</main>;
  if (!session) return <AuthForm />;
  return (
    <main className="relative min-h-screen bg-[#080a09] px-4 py-8 text-white sm:px-8">
      <div className="pointer-events-none fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/dashboard-background.png')" }} />
      <div className="pointer-events-none fixed inset-0 bg-black/15" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <Header onOpenSettings={() => setSettingsOpen(true)} />
        {error && <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur-md">{error}</div>}
        <AccountSelector
          accounts={accounts.filter(account => account.status === "active")}
          selectedAccountId={selectedAccountId}
          onAccountChange={accountId => { setSelectedAccountId(accountId); setSelectedDate(null); }}
          onOpenSettings={() => setSettingsOpen(true)}
        />
        <LegacyTradesBanner count={unassignedEntries.length} account={selectedAccount} loading={migrationLoading} onAssign={() => void handleAssignOldTrades(selectedAccount)} />
        {selectedAccount && <DashboardViewSwitch selected={dashboardView} onChange={setDashboardView} />}
        <DashboardAccountContent
          selectedAccount={selectedAccount} selectedAccountId={selectedAccountId} dashboardView={dashboardView}
          accountEntries={accountEntries} accountCashFlows={accountCashFlows}
          allEntries={entries} accounts={accounts} journalRefreshToken={journalRefreshToken}
          onOpenJournalTrade={openJournalTrade}
          cashFlowsLoading={cashFlowsLoading} entriesLoading={entriesLoading}
          settingsLoading={settingsLoading} month={month} year={year}
          onPreviousMonth={handlePreviousMonth} onNextMonth={handleNextMonth}
          onMonthChange={setMonth} onYearChange={setYear} onDayClick={setSelectedDate}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      </div>
      {selectedDate && selectedAccount && <DailyEntryModal
        date={selectedDate} entries={selectedDateEntries} account={selectedAccount}
        saving={saving} deletingEntryId={deletingEntryId}
        onClose={closeTradeModal}
        onAddEntry={handleAddEntry} onDeleteEntry={handleDeleteEntry}
        onUpdateEntry={handleUpdateEntry}
      />}
      {settingsOpen && userSettings && <SettingsModal
        settings={userSettings} accounts={accounts} cashFlows={cashFlows}
        onClose={() => { setSettingsOpen(false); setJournalRefreshToken(value => value + 1); }}
        onSaveSettings={handleSaveSettings}
        onCreateAccount={handleCreateAccount}
        onUpdateAccount={handleUpdateAccount}
        onAddCashFlow={handleAddCashFlow}
        onDeleteCashFlow={handleDeleteCashFlow}
      />}
      {settingsOpen && settingsLoading && !userSettings && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 text-neutral-400 backdrop-blur-sm">Loading settings...</div>}
    </main>
  );
}
export default App;
