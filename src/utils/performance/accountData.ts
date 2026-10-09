import type { Account } from "../../types/account";
import type { CashFlow } from "../../types/cashFlow";
import type { PerformanceEntry } from "../../types/entry";

export function getAccountEntries(

  account: Account,

  entries: PerformanceEntry[],

): PerformanceEntry[] {

  return entries.filter(

    (entry) =>

      entry.accountId ===

      account.id,

  );

}

export function getAccountCashFlows(

  account: Account,

  cashFlows: CashFlow[],

): CashFlow[] {

  return cashFlows.filter(

    (cashFlow) =>

      cashFlow.accountId ===

      account.id,

  );

}

export function hasValidStartingPoint(

  account: Account,

): boolean {

  return (

    account.startingCapital !==

      null &&

    Number.isFinite(

      account.startingCapital,

    ) &&

    account.startingCapital >=

      0 &&

    account.startingDate !==

      null

  );

}

export function clampStartDateToAccount(

  account: Account,

  requestedStartDate: string,

): string | null {

  if (

    !hasValidStartingPoint(account) ||

    account.startingDate === null

  ) {

    return null;

  }

  return requestedStartDate <

    account.startingDate

    ? account.startingDate

    : requestedStartDate;

}
