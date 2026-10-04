export type CountryCode =
  | "CA"
  | "US";

export type CurrencyCode =
  | "CAD"
  | "USD";

export type AccountStatus =
  | "active"
  | "archived";

export interface UserSettings {
  userId: string;
  country: CountryCode;
  displayCurrency: CurrencyCode;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserSettingsRow {
  user_id: string;
  country: CountryCode;
  display_currency: CurrencyCode;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  name: string;
  accountType: string;
  defaultCurrency: CurrencyCode;

  startingCapital: number | null;

  startingCapitalCurrency:
    | CurrencyCode
    | null;

  startingDate: string | null;

  status: AccountStatus;

  createdAt?: string;
  updatedAt?: string;
}

export interface AccountRow {
  id: string;
  user_id: string;
  name: string;
  account_type: string;
  default_currency: CurrencyCode;

  starting_capital:
    | number
    | string
    | null;

  starting_capital_currency:
    | CurrencyCode
    | null;

  starting_date: string | null;

  status: AccountStatus;

  created_at: string;
  updated_at: string;
}

export interface CreateAccountInput {
  name: string;
  accountType: string;
  defaultCurrency: CurrencyCode;

  startingCapital: number | null;

  startingCapitalCurrency:
    CurrencyCode;

  startingDate: string | null;
}