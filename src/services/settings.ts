import { supabase } from "../lib/supabase";

import type {
  CountryCode,
  CurrencyCode,
  UserSettings,
  UserSettingsRow,
} from "../types/account";

function convertRowToSettings(
  row: UserSettingsRow,
): UserSettings {
  return {
    userId: row.user_id,
    country: row.country,
    displayCurrency:
      row.display_currency,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUserSettings(): Promise<UserSettings> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in.",
    );
  }

  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  /*
   * No settings yet.
   * Create default Canadian settings.
   */
  if (!data) {
    const {
      data: createdSettings,
      error: createError,
    } = await supabase
      .from("user_settings")
      .insert({
        user_id: user.id,
        country: "CA",
        display_currency: "CAD",
      })
      .select()
      .single();

    if (createError) {
      throw new Error(
        createError.message,
      );
    }

    return convertRowToSettings(
      createdSettings as UserSettingsRow,
    );
  }

  return convertRowToSettings(
    data as UserSettingsRow,
  );
}

export async function updateUserSettings(
  country: CountryCode,
  displayCurrency: CurrencyCode,
): Promise<UserSettings> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in.",
    );
  }

  const { data, error } = await supabase
    .from("user_settings")
    .upsert(
      {
        user_id: user.id,
        country,
        display_currency:
          displayCurrency,
        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return convertRowToSettings(
    data as UserSettingsRow,
  );
}