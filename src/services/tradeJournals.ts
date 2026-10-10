import { supabase } from "../lib/supabase";
import type { SaveTradeJournalInput, TradeJournal, TradeJournalRow } from "../types/journal";

async function currentUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("You must be logged in.");
  return user.id;
}

function optionalText(value: string | null | undefined, maxLength: number, label: string): string | null {
  const text = value?.trim() || null;
  if (text && text.length > maxLength) throw new Error(`${label} must be at most ${maxLength} characters.`);
  return text;
}

function mapJournal(row: TradeJournalRow, tagIds: string[]): TradeJournal {
  return {
    id: row.id, userId: row.user_id, entryId: row.entry_id,
    ticker: row.ticker, companyName: row.company_name,
    strategyId: row.strategy_id, journalNotes: row.journal_notes,
    tagIds, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

export async function getTradeJournals(entryIds?: string[]): Promise<TradeJournal[]> {
  const userId = await currentUserId();
  if (entryIds && entryIds.length === 0) return [];
  let query = supabase.from("trade_journals").select("*").eq("user_id", userId);
  if (entryIds) query = query.in("entry_id", entryIds);
  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const rows = (data ?? []) as TradeJournalRow[];
  if (rows.length === 0) return [];
  const { data: links, error: linksError } = await supabase.from("trade_journal_tags")
    .select("journal_id, tag_id").eq("user_id", userId)
    .in("journal_id", rows.map(row => row.id));
  if (linksError) throw new Error(linksError.message);
  const tagMap = new Map<string, string[]>();
  for (const link of links ?? []) {
    const current = tagMap.get(link.journal_id) ?? [];
    current.push(link.tag_id);
    tagMap.set(link.journal_id, current);
  }
  return rows.map(row => mapJournal(row, tagMap.get(row.id) ?? []));
}

export async function saveTradeJournal(input: SaveTradeJournalInput): Promise<TradeJournal> {
  const userId = await currentUserId();
  const ticker = optionalText(input.ticker, 32, "Ticker")?.toUpperCase() ?? null;
  const companyName = optionalText(input.companyName, 200, "Company name");
  const strategyId = input.strategyId || null;
  const journalNotes = input.journalNotes ?? null;
  const tagIds = [...new Set(input.tagIds ?? [])];

  // The composite foreign keys in Phase 6A enforce that all IDs belong to this user.
  const { data, error } = await supabase.from("trade_journals").upsert({
    user_id: userId, entry_id: input.entryId, ticker,
    company_name: companyName, strategy_id: strategyId,
    journal_notes: journalNotes, updated_at: new Date().toISOString(),
  }, { onConflict: "entry_id" }).select("*").single();
  if (error) throw new Error(error.message);
  const row = data as TradeJournalRow;

  const { data: existing, error: readError } = await supabase.from("trade_journal_tags")
    .select("tag_id").eq("user_id", userId).eq("journal_id", row.id);
  if (readError) throw new Error(readError.message);
  const oldIds = new Set((existing ?? []).map(link => link.tag_id));
  const desired = new Set(tagIds);
  const toAdd = tagIds.filter(id => !oldIds.has(id));
  const toRemove = [...oldIds].filter(id => !desired.has(id));

  // Add first, then remove. This is not an atomic cross-table transaction.
  if (toAdd.length) {
    const { error: addError } = await supabase.from("trade_journal_tags")
      .insert(toAdd.map(tagId => ({ user_id: userId, journal_id: row.id, tag_id: tagId })));
    if (addError) throw new Error(`Journal saved, but tags could not be added: ${addError.message}`);
  }
  if (toRemove.length) {
    const { error: removeError } = await supabase.from("trade_journal_tags")
      .delete().eq("user_id", userId).eq("journal_id", row.id).in("tag_id", toRemove);
    if (removeError) throw new Error(`Journal saved, but old tags could not be removed: ${removeError.message}`);
  }
  return mapJournal(row, tagIds);
}

export async function deleteTradeJournal(entryId: string): Promise<void> {
  const userId = await currentUserId();
  const { error } = await supabase.from("trade_journals")
    .delete().eq("entry_id", entryId).eq("user_id", userId);
  if (error) throw new Error(error.message);
}
