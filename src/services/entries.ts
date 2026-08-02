import { supabase } from "../lib/supabase";

import type {
  PerformanceEntry,
  PerformanceEntryRow,
} from "../types/entry";

function convertRowToEntry(
  row: PerformanceEntryRow,
): PerformanceEntry {
  return {
    id: row.id,
    date: row.entry_date,
    percentage:
      row.percentage === null
        ? null
        : Number(row.percentage),
    amount:
      row.amount === null
        ? null
        : Number(row.amount),
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

export async function getEntries(): Promise<
  PerformanceEntry[]
> {
  const { data, error } = await supabase
    .from("performance_entries")
    .select("*")
    .order("entry_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as PerformanceEntryRow[]).map(
    convertRowToEntry,
  );
}

export async function createEntry(
  entry: Omit<PerformanceEntry, "id" | "createdAt">,
): Promise<PerformanceEntry> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be logged in.");
  }

  const { data, error } = await supabase
    .from("performance_entries")
    .insert({
      user_id: user.id,
      entry_date: entry.date,
      percentage: entry.percentage,
      amount: entry.amount,
      notes: entry.notes ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return convertRowToEntry(
    data as PerformanceEntryRow,
  );
}

export async function deleteEntry(
  entryId: string,
): Promise<void> {
  const { error } = await supabase
    .from("performance_entries")
    .delete()
    .eq("id", entryId);

  if (error) {
    throw new Error(error.message);
  }
}