import { supabase } from "../lib/supabase";

import type {
  CurrencyCode,
} from "../types/account";

import type {
  PerformanceEntry,
  PerformanceEntryRow,
} from "../types/entry";

function convertRowToEntry(
  row: PerformanceEntryRow,
): PerformanceEntry {
  return {
    id: row.id,

    accountId:
      row.account_id,

    date:
      row.entry_date,

    percentage:
      row.percentage === null
        ? null
        : Number(row.percentage),

    amount:
      row.amount === null
        ? null
        : Number(row.amount),

    currency:
      row.currency,

    notes:
      row.notes ?? undefined,

    createdAt:
      row.created_at,
  };
}

/*
 * =========================================================
 * GET ALL ENTRIES
 * =========================================================
 *
 * We still load all of the user's entries because we need
 * to detect old trades that have no account yet.
 */

export async function getEntries(): Promise<
  PerformanceEntry[]
> {
  const { data, error } =
    await supabase
      .from("performance_entries")
      .select("*")
      .order("entry_date", {
        ascending: true,
      })
      .order("created_at", {
        ascending: true,
      });

  if (error) {
    throw new Error(
      error.message,
    );
  }

  return (
    data as PerformanceEntryRow[]
  ).map(convertRowToEntry);
}

/*
 * =========================================================
 * CREATE TRADE
 * =========================================================
 */

interface CreateEntryInput {
  accountId: string;

  date: string;

  amount: number;

  currency: CurrencyCode;

  /*
   * Kept for old architecture compatibility.
   * New trades normally leave this null until
   * our return engine calculates it.
   */
  percentage?: number | null;

  notes?: string;
}

export async function createEntry(
  entry: CreateEntryInput,
): Promise<PerformanceEntry> {
  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in.",
    );
  }

  const { data, error } =
    await supabase
      .from("performance_entries")
      .insert({
        user_id:
          user.id,

        account_id:
          entry.accountId,

        entry_date:
          entry.date,

        amount:
          entry.amount,

        currency:
          entry.currency,

        percentage:
          entry.percentage ??
          null,

        notes:
          entry.notes ?? null,
      })
      .select()
      .single();

  if (error) {
    throw new Error(
      error.message,
    );
  }

  return convertRowToEntry(
    data as PerformanceEntryRow,
  );
}

/*
 * =========================================================
 * DELETE TRADE
 * =========================================================
 */

export async function deleteEntry(
  entryId: string,
): Promise<void> {
  const { error } =
    await supabase
      .from("performance_entries")
      .delete()
      .eq("id", entryId);

  if (error) {
    throw new Error(
      error.message,
    );
  }
}

/*
 * =========================================================
 * ASSIGN OLD TRADES TO ACCOUNT
 * =========================================================
 *
 * Existing trades currently have:
 *
 * account_id = null
 * currency   = null
 *
 * This function assigns them to one account and uses that
 * account's default currency.
 *
 * No trade is deleted.
 */

export async function assignUnassignedEntries(
  accountId: string,
  currency: CurrencyCode,
): Promise<void> {
  const { error } =
    await supabase
      .from("performance_entries")
      .update({
        account_id:
          accountId,

        currency,
      })
      .is(
        "account_id",
        null,
      );

  if (error) {
    throw new Error(
      error.message,
    );
  }
}