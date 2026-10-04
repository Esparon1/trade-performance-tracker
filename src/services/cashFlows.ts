import { supabase } from "../lib/supabase";

import type {
  CashFlow,
  CashFlowRow,
  CreateCashFlowInput,
} from "../types/cashFlow";

function convertRow(
  row: CashFlowRow,
): CashFlow {
  return {
    id: row.id,
    accountId: row.account_id,
    date: row.flow_date,
    type: row.flow_type,
    amount: Number(row.amount),
    currency: row.currency,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

export async function getCashFlows(): Promise<
  CashFlow[]
> {
  const {
    data,
    error,
  } = await supabase
    .from("cash_flows")
    .select("*")
    .order("flow_date", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(
      `Could not load cash flows: ${error.message}`,
    );
  }

  return (
    (data ?? []) as CashFlowRow[]
  ).map(convertRow);
}

export async function createCashFlow(
  input: CreateCashFlowInput,
): Promise<CashFlow> {
  const {
    data: authData,
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(
      `Could not verify user: ${authError.message}`,
    );
  }

  const user = authData.user;

  if (!user) {
    throw new Error(
      "You must be logged in to add a cash flow.",
    );
  }

  if (
    !Number.isFinite(input.amount) ||
    input.amount <= 0
  ) {
    throw new Error(
      "Cash flow amount must be greater than 0.",
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("cash_flows")
    .insert({
      user_id: user.id,
      account_id: input.accountId,
      flow_date: input.date,
      flow_type: input.type,
      amount: input.amount,
      currency: input.currency,
      notes:
        input.notes?.trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Could not create cash flow: ${error.message}`,
    );
  }

  return convertRow(
    data as CashFlowRow,
  );
}

export async function deleteCashFlow(
  id: string,
): Promise<void> {
  const {
    error,
  } = await supabase
    .from("cash_flows")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(
      `Could not delete cash flow: ${error.message}`,
    );
  }
}