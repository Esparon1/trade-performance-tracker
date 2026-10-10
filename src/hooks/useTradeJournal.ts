import { useCallback, useState } from "react";
import type { SaveTradeJournalInput, TradeJournal } from "../types/journal";
import { deleteTradeJournal, getTradeJournals, saveTradeJournal } from "../services/tradeJournals";

export function useTradeJournal() {
  const [journals, setJournals] = useState<TradeJournal[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (entryIds?: string[]) => {
    setLoading(true); setError("");
    try { setJournals(await getTradeJournals(entryIds)); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Could not load journals."); }
    finally { setLoading(false); }
  }, []);

  const save = useCallback(async (input: SaveTradeJournalInput): Promise<boolean> => {
    setSaving(true); setError("");
    try {
      const result = await saveTradeJournal(input);
      setJournals(current => [result, ...current.filter(item => item.entryId !== result.entryId)]);
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save journal.");
      return false;
    } finally { setSaving(false); }
  }, []);

  const remove = useCallback(async (entryId: string): Promise<boolean> => {
    setSaving(true); setError("");
    try {
      await deleteTradeJournal(entryId);
      setJournals(current => current.filter(item => item.entryId !== entryId));
      return true;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete journal.");
      return false;
    } finally { setSaving(false); }
  }, []);

  return { journals, loading, saving, error, load, save, remove,
    clear: () => { setJournals([]); setError(""); } };
}
