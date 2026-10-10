import { useCallback, useState } from "react";
import type { JournalOption, JournalRecommendation } from "../types/journal";
import {
  archiveJournalOption, createJournalOption, getJournalOptions,
  getJournalRecommendations, renameJournalOption, setJournalOptionEnabled,
} from "../services/journalTaxonomy";

type Kind = "strategy" | "tag";
export function useJournalTaxonomy() {
  const [strategies, setStrategies] = useState<JournalOption[]>([]);
  const [tags, setTags] = useState<JournalOption[]>([]);
  const [recommendations, setRecommendations] = useState<JournalRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [nextStrategies, nextTags, nextRecommendations] = await Promise.all([
        getJournalOptions("strategy"), getJournalOptions("tag"), getJournalRecommendations(),
      ]);
      setStrategies(nextStrategies); setTags(nextTags); setRecommendations(nextRecommendations);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load strategies and tags.");
    } finally { setLoading(false); }
  }, []);

  const mutate = useCallback(async (action: () => Promise<JournalOption>, kind: Kind) => {
    setSaving(true); setError("");
    try {
      const result = await action();
      const update = (items: JournalOption[]) => result.isArchived
        ? items.filter(item => item.id !== result.id)
        : [...items.filter(item => item.id !== result.id), result].sort((a, b) => a.name.localeCompare(b.name));
      if (kind === "strategy") setStrategies(update); else setTags(update);
      return result;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save option.");
      return null;
    } finally { setSaving(false); }
  }, []);

  return {
    strategies, tags, recommendations, loading, saving, error, load,
    create: (kind: Kind, name: string, source: "recommended" | "custom" = "custom") =>
      mutate(() => createJournalOption(kind, name, source), kind),
    rename: (kind: Kind, id: string, name: string) =>
      mutate(() => renameJournalOption(kind, id, name), kind),
    setEnabled: (kind: Kind, id: string, enabled: boolean) =>
      mutate(() => setJournalOptionEnabled(kind, id, enabled), kind),
    archive: (kind: Kind, id: string) =>
      mutate(() => archiveJournalOption(kind, id), kind),
    clear: () => { setStrategies([]); setTags([]); setRecommendations([]); setError(""); },
  };
}
