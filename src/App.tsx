import { useCallback, useEffect, useState } from "react";

import type { Session } from "@supabase/supabase-js";

import AuthForm from "./components/auth/AuthForm";
import Calendar from "./components/calendar/Calendar";
import CalendarHeader from "./components/calendar/CalendarHeader";
import Header from "./components/layout/Header";
import DailyEntryModal from "./components/modal/DailyEntryModal";
import SummaryCards from "./components/summary/SummaryCards";

import { supabase } from "./lib/supabase";

import {
  createEntry,
  deleteEntry,
  getEntries,
} from "./services/entries";

import type {
  DisplayMode,
  PerformanceEntry,
} from "./types/entry";

function App() {
  const currentDate = new Date();

  const [session, setSession] =
    useState<Session | null>(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [entriesLoading, setEntriesLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [
    deletingEntryId,
    setDeletingEntryId,
  ] = useState<string | null>(null);

  const [error, setError] = useState("");

  const [month, setMonth] = useState(
    currentDate.getMonth(),
  );

  const [year, setYear] = useState(
    currentDate.getFullYear(),
  );

  const [displayMode, setDisplayMode] =
    useState<DisplayMode>("both");

  const [entries, setEntries] = useState<
    PerformanceEntry[]
  >([]);

  const [selectedDate, setSelectedDate] =
    useState<string | null>(null);

  const selectedDateEntries = selectedDate
    ? entries.filter(
        (entry) => entry.date === selectedDate,
      )
    : [];

  const loadEntries = useCallback(async () => {
    setEntriesLoading(true);
    setError("");

    try {
      const storedEntries = await getEntries();
      setEntries(storedEntries);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not load entries.",
      );
    } finally {
      setEntriesLoading(false);
    }
  }, []);

  useEffect(() => {
    void supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
        setAuthLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setAuthLoading(false);

        if (!nextSession) {
          setEntries([]);
          setSelectedDate(null);
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session) {
      void loadEntries();
    }
  }, [session, loadEntries]);

  function handlePreviousMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(
        (currentYear) => currentYear - 1,
      );
      return;
    }

    setMonth(
      (currentMonth) => currentMonth - 1,
    );
  }

  function handleNextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(
        (currentYear) => currentYear + 1,
      );
      return;
    }

    setMonth(
      (currentMonth) => currentMonth + 1,
    );
  }

  async function handleAddEntry(
    newEntry: Omit<
      PerformanceEntry,
      "id" | "createdAt"
    >,
  ): Promise<boolean> {
    setSaving(true);
    setError("");

    try {
      const savedEntry =
        await createEntry(newEntry);

      setEntries((currentEntries) => [
        ...currentEntries,
        savedEntry,
      ]);

      return true;
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not save the entry.",
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteEntry(
    id: string,
  ): Promise<void> {
    setDeletingEntryId(id);
    setError("");

    try {
      await deleteEntry(id);

      setEntries((currentEntries) =>
        currentEntries.filter(
          (entry) => entry.id !== id,
        ),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not delete the entry.",
      );
    } finally {
      setDeletingEntryId(null);
    }
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
        Loading...
      </main>
    );
  }

  if (!session) {
    return <AuthForm />;
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Header />

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <SummaryCards
          entries={entries}
          month={month}
          year={year}
        />

        <CalendarHeader
          month={month}
          year={year}
          displayMode={displayMode}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onMonthChange={setMonth}
          onYearChange={setYear}
          onDisplayModeChange={
            setDisplayMode
          }
        />

        {entriesLoading ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-10 text-center text-neutral-400">
            Loading your entries...
          </div>
        ) : (
          <Calendar
            year={year}
            month={month}
            entries={entries}
            displayMode={displayMode}
            onDayClick={setSelectedDate}
          />
        )}
      </div>

      {selectedDate && (
        <DailyEntryModal
          date={selectedDate}
          entries={selectedDateEntries}
          saving={saving}
          deletingEntryId={
            deletingEntryId
          }
          onClose={() =>
            setSelectedDate(null)
          }
          onAddEntry={handleAddEntry}
          onDeleteEntry={
            handleDeleteEntry
          }
        />
      )}
    </main>
  );
}

export default App;