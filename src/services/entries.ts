import { supabase } from "../lib/supabase";
import type { CurrencyCode } from "../types/account";
import type { PerformanceEntry, PerformanceEntryRow } from "../types/entry";

function convertRowToEntry(row: PerformanceEntryRow): PerformanceEntry {
  return {
    id: row.id,
    accountId: row.account_id,
    date: row.entry_date,
    percentage: row.percentage === null ? null : Number(row.percentage),
    amount: row.amount === null ? null : Number(row.amount),
    currency: row.currency,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

export async function getEntries(): Promise<PerformanceEntry[]> {
  const { data, error } = await supabase.from("performance_entries")
    .select("*")
    .order("entry_date", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data as PerformanceEntryRow[]).map(convertRowToEntry);
}

interface CreateEntryInput {
  accountId: string;
  date: string;
  amount: number;
  currency: CurrencyCode;
  percentage?: number | null;
  notes?: string;
}

export async function createEntry(entry: CreateEntryInput): Promise<PerformanceEntry> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("You must be logged in.");
  const { data, error } = await supabase.from("performance_entries")
    .insert({
      user_id: user.id,
      account_id: entry.accountId,
      entry_date: entry.date,
      amount: entry.amount,
      currency: entry.currency,
      percentage: entry.percentage ?? null,
      notes: entry.notes ?? null,
    }).select().single();
  if (error) throw new Error(error.message);
  return convertRowToEntry(data as PerformanceEntryRow);
}

interface UpdateEntryInput {
  date: string;
  amount: number;
  notes?: string;
}

export async function updateEntry(entryId: string, changes: UpdateEntryInput): Promise<PerformanceEntry> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("You must be logged in.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(changes.date) ||
      Number.isNaN(new Date(`${changes.date}T12:00:00`).getTime()) ||
      !Number.isFinite(changes.amount)) {
    throw new Error("Enter a valid trade date and P/L amount.");
  }
  const { data, error } = await supabase.from("performance_entries")
    .update({
      entry_date: changes.date,
      amount: changes.amount,
      notes: changes.notes?.trim() || null,
      percentage: null,
    })
    .eq("id", entryId)
    .eq("user_id", user.id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return convertRowToEntry(data as PerformanceEntryRow);
}

export async function deleteEntry(entryId: string): Promise<void> {
  const { error } = await supabase.from("performance_entries").delete().eq("id", entryId);
  if (error) throw new Error(error.message);
}

export async function assignUnassignedEntries(accountId: string, currency: CurrencyCode): Promise<void> {
  const { error } = await supabase.from("performance_entries")
    .update({ account_id: accountId, currency }).is("account_id", null);
  if (error) throw new Error(error.message);
}
