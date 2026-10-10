import { supabase } from "../lib/supabase";
import type {
  JournalOption, JournalOptionRow, JournalRecommendation,
  JournalRecommendationKind, JournalOptionSource,
} from "../types/journal";

type OptionKind = "strategy" | "tag";
const tableFor = (kind: OptionKind) => kind === "strategy" ? "journal_strategies" : "journal_tags";

function toOption(row: JournalOptionRow): JournalOption {
  return {
    id: row.id, userId: row.user_id, name: row.name,
    isEnabled: row.is_enabled, isArchived: row.is_archived,
    source: row.source, createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

async function currentUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("You must be logged in.");
  return user.id;
}

function cleanName(name: string): string {
  const cleaned = name.trim();
  if (!cleaned || cleaned.length > 100) throw new Error("Name must contain 1–100 characters.");
  return cleaned;
}

export async function getJournalOptions(kind: OptionKind, includeArchived = false): Promise<JournalOption[]> {
  const userId = await currentUserId();
  let query = supabase.from(tableFor(kind)).select("*").eq("user_id", userId);
  if (!includeArchived) query = query.eq("is_archived", false);
  const { data, error } = await query.order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data ?? []) as JournalOptionRow[]).map(toOption);
}

export async function getJournalRecommendations(): Promise<JournalRecommendation[]> {
  const { data, error } = await supabase.from("journal_recommendations")
    .select("id, kind, name, sort_order").eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(row => ({
    id: row.id as string,
    kind: row.kind as JournalRecommendationKind,
    name: row.name as string,
    sortOrder: row.sort_order as number,
  }));
}

export async function createJournalOption(
  kind: OptionKind, name: string, source: JournalOptionSource = "custom",
): Promise<JournalOption> {
  const userId = await currentUserId();
  const { data, error } = await supabase.from(tableFor(kind)).insert({
    user_id: userId, name: cleanName(name), source, is_enabled: true,
  }).select("*").single();
  if (error) throw new Error(error.message);
  return toOption(data as JournalOptionRow);
}

export async function renameJournalOption(kind: OptionKind, id: string, name: string): Promise<JournalOption> {
  const userId = await currentUserId();
  const { data, error } = await supabase.from(tableFor(kind))
    .update({ name: cleanName(name), updated_at: new Date().toISOString() })
    .eq("id", id).eq("user_id", userId).select("*").single();
  if (error) throw new Error(error.message);
  return toOption(data as JournalOptionRow);
}

export async function setJournalOptionEnabled(kind: OptionKind, id: string, enabled: boolean): Promise<JournalOption> {
  const userId = await currentUserId();
  const { data, error } = await supabase.from(tableFor(kind))
    .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
    .eq("id", id).eq("user_id", userId).select("*").single();
  if (error) throw new Error(error.message);
  return toOption(data as JournalOptionRow);
}

export async function archiveJournalOption(kind: OptionKind, id: string): Promise<JournalOption> {
  const userId = await currentUserId();
  const { data, error } = await supabase.from(tableFor(kind))
    .update({ is_archived: true, is_enabled: false, updated_at: new Date().toISOString() })
    .eq("id", id).eq("user_id", userId).select("*").single();
  if (error) throw new Error(error.message);
  return toOption(data as JournalOptionRow);
}
