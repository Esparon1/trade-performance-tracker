import { useCallback, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Account } from "../types/account";
import type { CashFlow, CreateCashFlowInput } from "../types/cashFlow";
import { createCashFlow, deleteCashFlow, getCashFlows } from "../services/cashFlows";

export function useCashFlows(setError: Dispatch<SetStateAction<string>>, accounts: Account[]) {
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [cashFlowsLoading, setCashFlowsLoading] = useState(false);

  const loadCashFlows = useCallback(async () => {
    setCashFlowsLoading(true);
    setError("");
    try {
      const storedCashFlows = await getCashFlows();
      setCashFlows(storedCashFlows);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not load cash flows.");
    } finally {
      setCashFlowsLoading(false);
    }
  }, [setError]);

  async function handleAddCashFlow(input: CreateCashFlowInput): Promise<boolean> {
    setError("");
    try {
      const account = accounts.find(currentAccount => currentAccount.id === input.accountId);
      if (!account) throw new Error("The selected account could not be found.");
      if (input.currency !== account.defaultCurrency) {
        throw new Error("Cash flow currency must match the account currency.");
      }
      if (account.startingDate && input.date < account.startingDate) {
        throw new Error("Cash flow cannot be before the account starting date.");
      }
      const savedCashFlow = await createCashFlow(input);
      setCashFlows(currentCashFlows => [savedCashFlow, ...currentCashFlows]);
      return true;
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not save the cash flow.");
      return false;
    }
  }

  async function handleDeleteCashFlow(id: string): Promise<void> {
    setError("");
    try {
      await deleteCashFlow(id);
      setCashFlows(currentCashFlows => currentCashFlows.filter(cashFlow => cashFlow.id !== id));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not delete the cash flow.");
      throw caughtError;
    }
  }

  return { cashFlows, setCashFlows, cashFlowsLoading, loadCashFlows, handleAddCashFlow, handleDeleteCashFlow };
}
