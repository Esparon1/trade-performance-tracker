import {
  useEffect,
  useState,
} from "react";

import type {
  Account,
  CountryCode,
  CreateAccountInput,
  CurrencyCode,
  UserSettings,
} from "../../types/account";

interface SettingsModalProps {
  settings: UserSettings;
  accounts: Account[];

  onClose: () => void;

  onSaveSettings: (
    country: CountryCode,
    currency: CurrencyCode,
  ) => Promise<void>;

  onCreateAccount: (
    input: CreateAccountInput,
  ) => Promise<void>;

  onUpdateAccount: (
    account: Account,
  ) => Promise<void>;
}

type SettingsSection =
  | "general"
  | "accounts"
  | "parameters";

const canadianAccountTypes = [
  "TFSA",
  "RRSP",
  "FHSA",
  "RESP",
  "Non-Registered",
  "Margin",
  "Cash",
  "Crypto",
  "Other",
];

const americanAccountTypes = [
  "Individual Brokerage",
  "Traditional IRA",
  "Roth IRA",
  "401(k)",
  "403(b)",
  "Margin",
  "Cash",
  "Crypto",
  "Other",
];

export default function SettingsModal({
  settings,
  accounts,
  onClose,
  onSaveSettings,
  onCreateAccount,
  onUpdateAccount,
}: SettingsModalProps) {
  const [section, setSection] =
    useState<SettingsSection>(
      "general",
    );

  const [country, setCountry] =
    useState<CountryCode>(
      settings.country,
    );

  const [
    displayCurrency,
    setDisplayCurrency,
  ] = useState<CurrencyCode>(
    settings.displayCurrency,
  );

  const [
    settingsSaving,
    setSettingsSaving,
  ] = useState(false);

  const [
    accountSaving,
    setAccountSaving,
  ] = useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /*
   * =====================================================
   * CREATE ACCOUNT
   * =====================================================
   */

  const [accountName, setAccountName] =
    useState("");

  const [
    accountType,
    setAccountType,
  ] = useState(
    settings.country === "CA"
      ? "TFSA"
      : "Individual Brokerage",
  );

  const [
    accountCurrency,
    setAccountCurrency,
  ] = useState<CurrencyCode>(
    settings.displayCurrency,
  );

  /*
   * =====================================================
   * PARAMETERS
   * =====================================================
   */

  const [
    selectedAccountId,
    setSelectedAccountId,
  ] = useState(
    accounts[0]?.id ?? "",
  );

  const selectedAccount =
    accounts.find(
      (account) =>
        account.id ===
        selectedAccountId,
    ) ?? null;

  const [
    parameterName,
    setParameterName,
  ] = useState("");

  const [
    parameterType,
    setParameterType,
  ] = useState("");

  const [
    parameterCurrency,
    setParameterCurrency,
  ] = useState<CurrencyCode>("CAD");

  const [
    startingCapital,
    setStartingCapital,
  ] = useState("");

  const [
    startingCapitalCurrency,
    setStartingCapitalCurrency,
  ] = useState<CurrencyCode>("CAD");

  const [
    startingDate,
    setStartingDate,
  ] = useState("");

  /*
   * Keep selected account valid if a new
   * account is created while modal is open.
   */

  useEffect(() => {
    if (
      !selectedAccountId &&
      accounts.length > 0
    ) {
      setSelectedAccountId(
        accounts[0].id,
      );
    }
  }, [
    accounts,
    selectedAccountId,
  ]);

  /*
   * Load account parameters whenever
   * selected account changes.
   */

  useEffect(() => {
    if (!selectedAccount) {
      setParameterName("");
      setParameterType("");
      setStartingCapital("");
      setStartingDate("");
      return;
    }

    setParameterName(
      selectedAccount.name,
    );

    setParameterType(
      selectedAccount.accountType,
    );

    setParameterCurrency(
      selectedAccount.defaultCurrency,
    );

    setStartingCapital(
      selectedAccount.startingCapital ===
        null
        ? ""
        : String(
            selectedAccount.startingCapital,
          ),
    );

    setStartingCapitalCurrency(
      selectedAccount
        .startingCapitalCurrency ??
        selectedAccount.defaultCurrency,
    );

    setStartingDate(
      selectedAccount.startingDate ??
        "",
    );
  }, [selectedAccount]);

  const accountTypes =
    country === "CA"
      ? canadianAccountTypes
      : americanAccountTypes;

  /*
   * =====================================================
   * SAVE GENERAL SETTINGS
   * =====================================================
   */

  async function handleSaveSettings() {
    setSettingsSaving(true);
    setError("");
    setMessage("");

    try {
      await onSaveSettings(
        country,
        displayCurrency,
      );

      setMessage(
        "General settings saved.",
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not save settings.",
      );
    } finally {
      setSettingsSaving(false);
    }
  }

  /*
   * =====================================================
   * CREATE ACCOUNT
   * =====================================================
   */

  async function handleCreateAccount() {
    if (!accountName.trim()) {
      setError(
        "Enter an account name.",
      );
      return;
    }

    setAccountSaving(true);
    setError("");
    setMessage("");

    try {
      await onCreateAccount({
        name: accountName.trim(),

        accountType,

        defaultCurrency:
          accountCurrency,

        startingCapital: null,

        startingCapitalCurrency:
          accountCurrency,

        startingDate: null,
      });

      setAccountName("");

      setMessage(
        "Account created.",
      );

      setSection("parameters");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not create account.",
      );
    } finally {
      setAccountSaving(false);
    }
  }

  /*
   * =====================================================
   * SAVE ACCOUNT PARAMETERS
   * =====================================================
   */

  async function handleSaveParameters() {
    if (!selectedAccount) {
      return;
    }

    if (!parameterName.trim()) {
      setError(
        "Account name cannot be empty.",
      );
      return;
    }

    const parsedCapital =
      startingCapital.trim() === ""
        ? null
        : Number(startingCapital);

    if (
      parsedCapital !== null &&
      Number.isNaN(parsedCapital)
    ) {
      setError(
        "Starting capital must be a valid number.",
      );
      return;
    }

    setAccountSaving(true);
    setError("");
    setMessage("");

    try {
      await onUpdateAccount({
        ...selectedAccount,

        name: parameterName.trim(),

        accountType:
          parameterType,

        defaultCurrency:
          parameterCurrency,

        startingCapital:
          parsedCapital,

        startingCapitalCurrency,

        startingDate:
          startingDate || null,
      });

      setMessage(
        "Account parameters saved.",
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not save account.",
      );
    } finally {
      setAccountSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">

      {/* BACKDROP */}

      <button
        type="button"
        aria-label="Close settings"
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
      />

      {/* PANEL */}

      <div className="relative z-10 flex max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/[0.10] bg-[#0d100f]/95 shadow-[0_30px_100px_rgba(0,0,0,0.65)]">

        {/* SIDEBAR */}

        <aside className="hidden w-56 shrink-0 border-r border-white/[0.07] bg-black/20 p-5 sm:block">

          <div className="mb-8">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400">
              Configuration
            </p>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Settings
            </h2>
          </div>

          <nav className="space-y-2">

            <SettingsButton
              active={
                section === "general"
              }
              onClick={() =>
                setSection("general")
              }
            >
              General
            </SettingsButton>

            <SettingsButton
              active={
                section === "accounts"
              }
              onClick={() =>
                setSection("accounts")
              }
            >
              Accounts
            </SettingsButton>

            <SettingsButton
              active={
                section ===
                "parameters"
              }
              onClick={() =>
                setSection(
                  "parameters",
                )
              }
            >
              Account Parameters
            </SettingsButton>

          </nav>
        </aside>

        {/* CONTENT */}

        <div className="min-w-0 flex-1 overflow-y-auto p-6 sm:p-8">

          {/* MOBILE NAV */}

          <div className="mb-6 flex gap-2 overflow-x-auto sm:hidden">
            <SettingsButton
              active={
                section === "general"
              }
              onClick={() =>
                setSection("general")
              }
            >
              General
            </SettingsButton>

            <SettingsButton
              active={
                section === "accounts"
              }
              onClick={() =>
                setSection("accounts")
              }
            >
              Accounts
            </SettingsButton>

            <SettingsButton
              active={
                section ===
                "parameters"
              }
              onClick={() =>
                setSection(
                  "parameters",
                )
              }
            >
              Parameters
            </SettingsButton>
          </div>

          {/* CLOSE */}

          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-lg text-neutral-400 transition hover:border-white/[0.16] hover:text-white"
          >
            ×
          </button>

          {/* MESSAGES */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/25 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-6 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-4 py-3 text-sm text-emerald-300">
              {message}
            </div>
          )}

          {/* ================================================= */}
          {/* GENERAL                                           */}
          {/* ================================================= */}

          {section === "general" && (
            <section>
              <SectionHeader
                title="General"
                description="Set your region and preferred display currency."
              />

              <div className="mt-8 max-w-xl space-y-12">

                <FieldLabel label="Country / Region">
                  <select
                    value={country}
                    onChange={(
                      event,
                    ) => {
                      const nextCountry =
                        event.target
                          .value as CountryCode;

                      setCountry(
                        nextCountry,
                      );

                      /*
                       * Helpful default when
                       * changing region.
                       */
                      setDisplayCurrency(
                        nextCountry ===
                          "CA"
                          ? "CAD"
                          : "USD",
                      );

                      setAccountCurrency(
                        nextCountry ===
                          "CA"
                          ? "CAD"
                          : "USD",
                      );

                      setAccountType(
                        nextCountry ===
                          "CA"
                          ? "TFSA"
                          : "Individual Brokerage",
                      );
                    }}
                    className={inputClass}
                  >
                    <option value="CA">
                      Canada
                    </option>

                    <option value="US">
                      United States
                    </option>
                  </select>
                </FieldLabel>

                <FieldLabel label="Preferred display currency">
                  <select
                    value={
                      displayCurrency
                    }
                    onChange={(
                      event,
                    ) =>
                      setDisplayCurrency(
                        event.target
                          .value as CurrencyCode,
                      )
                    }
                    className={inputClass}
                  >
                    <option value="CAD">
                      CAD — Canadian Dollar
                    </option>

                    <option value="USD">
                      USD — US Dollar
                    </option>
                  </select>
                </FieldLabel>

                <button
                  type="button"
                  disabled={
                    settingsSaving
                  }
                  onClick={() =>
                    void handleSaveSettings()
                  }
                  className={primaryButtonClass}
                >
                  {settingsSaving
                    ? "Saving..."
                    : "Save changes"}
                </button>

              </div>
            </section>
          )}

          {/* ================================================= */}
          {/* ACCOUNTS                                          */}
          {/* ================================================= */}

          {section === "accounts" && (
            <section>
              <SectionHeader
                title="Accounts"
                description="Create the accounts you want to track independently."
              />

              {accounts.length > 0 && (
                <div className="mt-8 grid gap-3 md:grid-cols-2">

                  {accounts.map(
                    (account) => (
                      <button
                        type="button"
                        key={
                          account.id
                        }
                        onClick={() => {
                          setSelectedAccountId(
                            account.id,
                          );

                          setSection(
                            "parameters",
                          );
                        }}
                        className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 text-left transition hover:border-emerald-500/30 hover:bg-emerald-500/[0.04]"
                      >
                        <div className="flex items-start justify-between gap-4">

                          <div>
                            <p className="font-medium text-white">
                              {
                                account.name
                              }
                            </p>

                            <p className="mt-1 text-sm text-neutral-500">
                              {
                                account.accountType
                              }
                            </p>
                          </div>

                          <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.07] px-2.5 py-1 text-xs font-medium text-emerald-400">
                            {
                              account.defaultCurrency
                            }
                          </span>

                        </div>
                      </button>
                    ),
                  )}

                </div>
              )}

              <div className="mt-8 max-w-xl rounded-2xl border border-white/[0.07] bg-black/20 p-5">

                <h3 className="font-medium text-white">
                  Add account
                </h3>

                <div className="mt-5 space-y-5">

                  <FieldLabel label="Account name">
                    <input
                      value={
                        accountName
                      }
                      onChange={(
                        event,
                      ) =>
                        setAccountName(
                          event.target
                            .value,
                        )
                      }
                      placeholder="My TFSA"
                      className={
                        inputClass
                      }
                    />
                  </FieldLabel>

                  <FieldLabel label="Account type">
                    <select
                      value={
                        accountType
                      }
                      onChange={(
                        event,
                      ) =>
                        setAccountType(
                          event.target
                            .value,
                        )
                      }
                      className={
                        inputClass
                      }
                    >
                      {accountTypes.map(
                        (type) => (
                          <option
                            key={type}
                            value={type}
                          >
                            {type}
                          </option>
                        ),
                      )}
                    </select>
                  </FieldLabel>

                  <FieldLabel label="Default trade currency">
                    <select
                      value={
                        accountCurrency
                      }
                      onChange={(
                        event,
                      ) =>
                        setAccountCurrency(
                          event.target
                            .value as CurrencyCode,
                        )
                      }
                      className={
                        inputClass
                      }
                    >
                      <option value="CAD">
                        CAD
                      </option>

                      <option value="USD">
                        USD
                      </option>
                    </select>
                  </FieldLabel>

                  <button
                    type="button"
                    disabled={
                      accountSaving
                    }
                    onClick={() =>
                      void handleCreateAccount()
                    }
                    className={
                      primaryButtonClass
                    }
                  >
                    {accountSaving
                      ? "Creating..."
                      : "Add account"}
                  </button>

                </div>
              </div>
            </section>
          )}

          {/* ================================================= */}
          {/* ACCOUNT PARAMETERS                                */}
          {/* ================================================= */}

          {section === "parameters" && (
            <section>
              <SectionHeader
                title="Account Parameters"
                description="These values belong only to the selected account."
              />

              {accounts.length === 0 ? (
                <div className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8 text-center">

                  <p className="text-neutral-400">
                    Create an account
                    before configuring
                    its parameters.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setSection(
                        "accounts",
                      )
                    }
                    className="mt-4 text-sm font-medium text-emerald-400 hover:text-emerald-300"
                  >
                    Create an account
                  </button>

                </div>
              ) : (
                <div className="mt-8 max-w-xl space-y-6">

                  <FieldLabel label="Account">
                    <select
                      value={
                        selectedAccountId
                      }
                      onChange={(
                        event,
                      ) =>
                        setSelectedAccountId(
                          event.target
                            .value,
                        )
                      }
                      className={
                        inputClass
                      }
                    >
                      {accounts.map(
                        (account) => (
                          <option
                            key={
                              account.id
                            }
                            value={
                              account.id
                            }
                          >
                            {
                              account.name
                            }
                          </option>
                        ),
                      )}
                    </select>
                  </FieldLabel>

                  <FieldLabel label="Account name">
                    <input
                      value={
                        parameterName
                      }
                      onChange={(
                        event,
                      ) =>
                        setParameterName(
                          event.target
                            .value,
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </FieldLabel>

                  <FieldLabel label="Account type">
                    <input
                      value={
                        parameterType
                      }
                      readOnly
                      className={`${inputClass} cursor-not-allowed text-neutral-500`}
                    />
                  </FieldLabel>

                  <FieldLabel label="Default trade currency">
                    <select
                      value={
                        parameterCurrency
                      }
                      onChange={(
                        event,
                      ) =>
                        setParameterCurrency(
                          event.target
                            .value as CurrencyCode,
                        )
                      }
                      className={
                        inputClass
                      }
                    >
                      <option value="CAD">
                        CAD
                      </option>

                      <option value="USD">
                        USD
                      </option>
                    </select>
                  </FieldLabel>

                  <FieldLabel label="Starting date">
                    <input
                      type="date"
                      value={
                        startingDate
                      }
                      onChange={(
                        event,
                      ) =>
                        setStartingDate(
                          event.target
                            .value,
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </FieldLabel>

                  <FieldLabel label="Starting capital">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        startingCapital
                      }
                      onChange={(
                        event,
                      ) =>
                        setStartingCapital(
                          event.target
                            .value,
                        )
                      }
                      placeholder="10000"
                      className={
                        inputClass
                      }
                    />
                  </FieldLabel>

                  <FieldLabel label="Starting capital currency">
                    <select
                      value={
                        startingCapitalCurrency
                      }
                      onChange={(
                        event,
                      ) =>
                        setStartingCapitalCurrency(
                          event.target
                            .value as CurrencyCode,
                        )
                      }
                      className={
                        inputClass
                      }
                    >
                      <option value="CAD">
                        CAD
                      </option>

                      <option value="USD">
                        USD
                      </option>
                    </select>
                  </FieldLabel>

                  <button
                    type="button"
                    disabled={
                      accountSaving
                    }
                    onClick={() =>
                      void handleSaveParameters()
                    }
                    className={
                      primaryButtonClass
                    }
                  >
                    {accountSaving
                      ? "Saving..."
                      : "Save account parameters"}
                  </button>

                </div>
              )}
            </section>
          )}

        </div>
      </div>
    </div>
  );
}

/*
 * =========================================================
 * SMALL REUSABLE COMPONENTS
 * =========================================================
 */

interface SettingsButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function SettingsButton({
  active,
  onClick,
  children,
}: SettingsButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full whitespace-nowrap rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
        active
          ? "border border-emerald-500/20 bg-emerald-500/[0.09] text-emerald-300"
          : "border border-transparent text-neutral-400 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

interface SectionHeaderProps {
  title: string;
  description: string;
}

function SectionHeader({
  title,
  description,
}: SectionHeaderProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-400/70">
        Settings
      </p>

      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
        {title}
      </h2>

      <p className="mt-2 text-sm text-neutral-500">
        {description}
      </p>
    </div>
  );
}

interface FieldLabelProps {
  label: string;
  children: React.ReactNode;
}

function FieldLabel({
  label,
  children,
}: FieldLabelProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-neutral-300">
        {label}
      </span>

      {children}
    </label>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-white/[0.09] bg-[#151817] px-4 text-sm text-neutral-200 outline-none transition focus:border-emerald-500/45 focus:ring-2 focus:ring-emerald-500/[0.08]";

const primaryButtonClass =
  "rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-5 py-2.5 text-sm font-medium text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.06)] transition hover:border-emerald-400/45 hover:bg-emerald-500/[0.15] disabled:cursor-not-allowed disabled:opacity-50";