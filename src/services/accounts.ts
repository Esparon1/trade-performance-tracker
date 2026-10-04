import { supabase } from "../lib/supabase";

import type {
  Account,
  AccountRow,
  CreateAccountInput,
} from "../types/account";

function convertRowToAccount(
  row: AccountRow,
): Account {
  return {
    id: row.id,

    name: row.name,

    accountType:
      row.account_type,

    defaultCurrency:
      row.default_currency,

    startingCapital:
      row.starting_capital === null
        ? null
        : Number(
            row.starting_capital,
          ),

    startingCapitalCurrency:
      row.starting_capital_currency,

    startingDate:
      row.starting_date,

    status: row.status,

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

export async function getAccounts(): Promise<
  Account[]
> {
  const { data, error } =
    await supabase
      .from("accounts")
      .select("*")
      .order("created_at", {
        ascending: true,
      });

  if (error) {
    throw new Error(error.message);
  }

  return (data as AccountRow[]).map(
    convertRowToAccount,
  );
}

export async function createAccount(
  input: CreateAccountInput,
): Promise<Account> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in.",
    );
  }

  const { data, error } =
    await supabase
      .from("accounts")
      .insert({
        user_id: user.id,

        name: input.name,

        account_type:
          input.accountType,

        default_currency:
          input.defaultCurrency,

        starting_capital:
          input.startingCapital,

        starting_capital_currency:
          input.startingCapitalCurrency,

        starting_date:
          input.startingDate,

        status: "active",
      })
      .select()
      .single();

  if (error) {
    throw new Error(error.message);
  }

  return convertRowToAccount(
    data as AccountRow,
  );
}

export async function updateAccount(
  account: Account,
): Promise<Account> {
  const { data, error } =
    await supabase
      .from("accounts")
      .update({
        name: account.name,

        account_type:
          account.accountType,

        default_currency:
          account.defaultCurrency,

        starting_capital:
          account.startingCapital,

        starting_capital_currency:
          account.startingCapitalCurrency,

        starting_date:
          account.startingDate,

        status:
          account.status,

        updated_at:
          new Date().toISOString(),
      })
      .eq("id", account.id)
      .select()
      .single();

  if (error) {
    throw new Error(error.message);
  }

  return convertRowToAccount(
    data as AccountRow,
  );
}