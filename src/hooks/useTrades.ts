import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Account, CurrencyCode } from "../types/account";
import type { PerformanceEntry } from "../types/entry";
import { assignUnassignedEntries, createEntry, deleteEntry, getEntries, updateEntry } from "../services/entries";

export interface AddEntryInput { accountId: string; date: string; amount: number; currency: CurrencyCode; percentage?: number | null; notes?: string; }
export interface UpdateEntryInput { date: string; amount: number; notes?: string; }

export function useTrades(setError: Dispatch<SetStateAction<string>>) {
  const [entries, setEntries] = useState<PerformanceEntry[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [migrationLoading, setMigrationLoading] = useState(false);
  const loadEntries = useCallback(async () => {
    setEntriesLoading(true); setError("");
    try { setEntries(await getEntries()); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not load entries."); }
    finally { setEntriesLoading(false); }
  }, [setError]);
  async function handleAddEntry(newEntry: AddEntryInput): Promise<string | null> {
    setSaving(true); setError("");
    try {
      const savedEntry = await createEntry(newEntry);
      setEntries(current => [...current, savedEntry]);
      return savedEntry.id;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the trade.");
      return null;
    } finally { setSaving(false); }
  }
  async function handleUpdateEntry(id: string, changes: UpdateEntryInput): Promise<boolean> {
    setSaving(true); setError("");
    try {
      const updated = await updateEntry(id, changes);
      setEntries(current => current.map(entry => entry.id === id ? updated : entry));
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update the trade.");
      return false;
    } finally { setSaving(false); }
  }
  async function handleDeleteEntry(id: string): Promise<void> {
    setDeletingEntryId(id); setError("");
    try { await deleteEntry(id); setEntries(current => current.filter(entry => entry.id !== id)); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not delete the trade."); }
    finally { setDeletingEntryId(null); }
  }
  async function handleAssignOldTrades(selectedAccount: Account | null): Promise<void> {
    if (!selectedAccount) return;
    setMigrationLoading(true); setError("");
    try { await assignUnassignedEntries(selectedAccount.id, selectedAccount.defaultCurrency); await loadEntries(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not assign old trades."); }
    finally { setMigrationLoading(false); }
  }
  return { entries, setEntries, entriesLoading, saving, deletingEntryId, migrationLoading,
    loadEntries, handleAddEntry, handleUpdateEntry, handleDeleteEntry, handleAssignOldTrades };
}
