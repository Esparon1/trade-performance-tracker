import type { Account } from "../../types/account";
import type { CashFlow } from "../../types/cashFlow";
import type { PerformanceEntry } from "../../types/entry";
import type { DailyPerformance } from "./types";
import { createLocalDate, formatDate } from "./dates";
import { getAccountEntries, getAccountCashFlows, hasValidStartingPoint } from "./accountData";
import { getPnlForDate, getPnlBetweenDates, getCashFlowForDate, getCashFlowBetweenDates } from "./transactions";

export function getEquityBeforeDate(

  account: Account,

  entries: PerformanceEntry[],

  cashFlows: CashFlow[],

  date: string,

): number | null {

  if (

    !hasValidStartingPoint(

      account,

    ) ||

    account.startingCapital ===

      null ||

    account.startingDate ===

      null

  ) {

    return null;

  }

  /*

   * Before the account's starting date,

   * the account does not yet exist for

   * performance calculations.

   */

  if (

    date <

    account.startingDate

  ) {

    return null;

  }

  /*

   * On the starting date, equity before

   * same-day cash flows/trading is simply

   * the configured starting capital.

   */

  if (

    date ===

    account.startingDate

  ) {

    return account.startingCapital;

  }

  const accountEntries =

    getAccountEntries(

      account,

      entries,

    );

  const accountCashFlows =

    getAccountCashFlows(

      account,

      cashFlows,

    );

  const previousDate =

    createLocalDate(

      date,

    );

  previousDate.setDate(

    previousDate.getDate() -

      1,

  );

  const previousDateString =

    formatDate(

      previousDate,

    );

  const previousPnl =

    getPnlBetweenDates(

      accountEntries,

      account.startingDate,

      previousDateString,

    );

  const previousCashFlow =

    getCashFlowBetweenDates(

      accountCashFlows,

      account.startingDate,

      previousDateString,

    );

  return (

    account.startingCapital +

    previousCashFlow +

    previousPnl

  );

}

export function getDailyPerformance(

  account: Account,

  entries: PerformanceEntry[],

  cashFlows: CashFlow[],

  date: string,

): DailyPerformance {

  const accountEntries =

    getAccountEntries(

      account,

      entries,

    );

  const accountCashFlows =

    getAccountCashFlows(

      account,

      cashFlows,

    );

  /*

   * Trades/cash flows before the configured

   * starting date must not affect returns.

   */

  if (

    account.startingDate &&

    date <

      account.startingDate

  ) {

    return {

      date,

      startingEquity: null,

      cashFlow: 0,

      pnl: 0,

      endingEquity: null,

      returnPercentage: null,

    };

  }

  const pnl =

    getPnlForDate(

      accountEntries,

      date,

    );

  const cashFlow =

    getCashFlowForDate(

      accountCashFlows,

      date,

    );

  const previousClosingEquity =

    getEquityBeforeDate(

      account,

      accountEntries,

      accountCashFlows,

      date,

    );

  if (

    previousClosingEquity ===

    null

  ) {

    return {

      date,

      startingEquity: null,

      cashFlow,

      pnl,

      endingEquity: null,

      returnPercentage: null,

    };

  }

  /*

   * Deposits and withdrawals occur before

   * trading for the day.

   */

  const startingEquity =

    previousClosingEquity +

    cashFlow;

  const endingEquity =

    startingEquity +

    pnl;

  /*

   * A meaningful percentage return requires

   * positive capital at risk.

   *

   * We never invent a percentage when equity

   * is zero or negative.

   */

  const returnPercentage =

    startingEquity > 0

      ? (pnl /

          startingEquity) *

        100

      : null;

  return {

    date,

    startingEquity,

    cashFlow,

    pnl,

    endingEquity,

    returnPercentage,

  };

}
