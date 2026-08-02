import { useState } from "react";

import Calendar from "./components/calendar/Calendar";
import CalendarHeader from "./components/calendar/CalendarHeader";
import Header from "./components/layout/Header";
import DailyEntryModal from "./components/modal/DailyEntryModal";
import SummaryCards from "./components/summary/SummaryCards";

import { sampleEntries } from "./data/sampleEntries";

import type {
  DisplayMode,
  PerformanceEntry,
} from "./types/entry";

function App() {
  const currentDate = new Date();

  const [month, setMonth] = useState(
    currentDate.getMonth(),
  );

  const [year, setYear] = useState(
    currentDate.getFullYear(),
  );

  const [displayMode, setDisplayMode] =
    useState<DisplayMode>("both");

  const [entries, setEntries] =
    useState<PerformanceEntry[]>(sampleEntries);

  const [selectedDate, setSelectedDate] =
    useState<string | null>(null);

  const selectedDateEntries = selectedDate
    ? entries.filter(
        (entry) => entry.date === selectedDate,
      )
    : [];

  function handlePreviousMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((currentYear) => currentYear - 1);
      return;
    }

    setMonth((currentMonth) => currentMonth - 1);
  }

  function handleNextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((currentYear) => currentYear + 1);
      return;
    }

    setMonth((currentMonth) => currentMonth + 1);
  }

  function handleAddEntry(
    newEntry: Omit<PerformanceEntry, "id">,
  ) {
    const entry: PerformanceEntry = {
      ...newEntry,
      id: crypto.randomUUID(),
    };

    setEntries((currentEntries) => [
      ...currentEntries,
      entry,
    ]);
  }

  function handleDeleteEntry(id: string) {
    setEntries((currentEntries) =>
      currentEntries.filter(
        (entry) => entry.id !== id,
      ),
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Header />

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
          onDisplayModeChange={setDisplayMode}
        />

        <Calendar
          year={year}
          month={month}
          entries={entries}
          displayMode={displayMode}
          onDayClick={setSelectedDate}
        />
      </div>

      {selectedDate && (
        <DailyEntryModal
          date={selectedDate}
          entries={selectedDateEntries}
          onClose={() => setSelectedDate(null)}
          onAddEntry={handleAddEntry}
          onDeleteEntry={handleDeleteEntry}
        />
      )}
    </main>
  );
}

export default App;