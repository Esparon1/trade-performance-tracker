import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Account, CountryCode, CreateAccountInput, CurrencyCode, UserSettings } from "../types/account";
import { createAccount, getAccounts, updateAccount } from "../services/accounts";
import { getUserSettings, updateUserSettings } from "../services/settings";

export function useAccounts(setError: Dispatch<SetStateAction<string>>) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const selectedAccount = useMemo(() =>
    accounts.find(account => account.id === selectedAccountId) ?? null,
    [accounts, selectedAccountId]
  );

  const loadSettingsAndAccounts = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const [storedSettings, storedAccounts] = await Promise.all([getUserSettings(), getAccounts()]);
      setUserSettings(storedSettings);
      setAccounts(storedAccounts);
      const firstActiveAccount = storedAccounts.find(account => account.status === "active");
      if (firstActiveAccount) {
        setSelectedAccountId(currentAccountId => currentAccountId ?? firstActiveAccount.id);
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not load settings.");
    } finally {
      setSettingsLoading(false);
    }
  }, [setError]);

  useEffect(() => {
    if (accounts.length === 0) {
      setSelectedAccountId(null);
      return;
    }
    const stillExists = accounts.some(account => account.id === selectedAccountId && account.status === "active");
    if (!stillExists) {
      const firstActive = accounts.find(account => account.status === "active");
      setSelectedAccountId(firstActive?.id ?? null);
    }
  }, [accounts, selectedAccountId]);

  async function handleSaveSettings(country: CountryCode, currency: CurrencyCode): Promise<void> {
    const savedSettings = await updateUserSettings(country, currency);
    setUserSettings(savedSettings);
  }

  async function handleCreateAccount(input: CreateAccountInput): Promise<void> {
    const savedAccount = await createAccount(input);
    setAccounts(currentAccounts => [...currentAccounts, savedAccount]);
    setSelectedAccountId(currentAccountId => currentAccountId ?? savedAccount.id);
  }

  async function handleUpdateAccount(account: Account): Promise<void> {
    const savedAccount = await updateAccount(account);
    setAccounts(currentAccounts => currentAccounts.map(currentAccount =>
      currentAccount.id === savedAccount.id ? savedAccount : currentAccount
    ));
  }

  return {
    accounts, setAccounts, userSettings, setUserSettings,
    selectedAccountId, setSelectedAccountId, selectedAccount, settingsLoading,
    loadSettingsAndAccounts, handleSaveSettings, handleCreateAccount, handleUpdateAccount,
  };
}
