import type { Account } from "../../types/account";
import type { CashFlow } from "../../types/cashFlow";
import type { PerformanceEntry } from "../../types/entry";
import type { MonthlyPerformance } from "./types";
import { getMonthStartDate, getMonthEndDate, createLocalDate, formatDate } from "./dates";
import { getAccountEntries, getAccountCashFlows } from "./accountData";
import { getPnlBetweenDates, getCashFlowTotalsBetweenDates } from "./transactions";
import { getEquityBeforeDate, getDailyPerformance } from "./daily";

export function getMonthlyPerformance(

  account: Account,

  entries: PerformanceEntry[],

  cashFlows: CashFlow[],

  year: number,

  month: number,

): MonthlyPerformance {

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

  const monthStart =

    getMonthStartDate(

      year,

      month,

    );

  const monthEnd =

    getMonthEndDate(

      year,

      month,

    );

  /*

   * If the account starts after this month,

   * there is no valid performance period.

   */

  if (

    account.startingDate &&

    account.startingDate >

      monthEnd

  ) {

    return {

      startingEquity: null,

      deposits: 0,

      withdrawals: 0,

      netCashFlow: 0,

      pnl: 0,

      endingEquity: null,

      returnPercentage: null,

    };

  }

  const calculationStart =

    account.startingDate &&

    account.startingDate >

      monthStart

      ? account.startingDate

      : monthStart;

  const monthlyPnl =

    getPnlBetweenDates(

      accountEntries,

      calculationStart,

      monthEnd,

    );

  const {

    deposits,

    withdrawals,

  } =

    getCashFlowTotalsBetweenDates(

      accountCashFlows,

      calculationStart,

      monthEnd,

    );

  const netCashFlow =

    deposits -

    withdrawals;

  const startingEquity =

    getEquityBeforeDate(

      account,

      accountEntries,

      accountCashFlows,

      calculationStart,

    );

  if (

    startingEquity === null

  ) {

    return {

      startingEquity: null,

      deposits,

      withdrawals,

      netCashFlow,

      pnl: monthlyPnl,

      endingEquity: null,

      returnPercentage: null,

    };

  }

  const endingEquity =

    startingEquity +

    netCashFlow +

    monthlyPnl;

  /*

   * Time-weighted monthly return.

   */

  let growthFactor = 1;

  let hasValidPerformancePeriod =

    false;

  let hasInvalidTradingDay =

    false;

  const currentDate =

    createLocalDate(

      calculationStart,

    );

  const finalDate =

    createLocalDate(

      monthEnd,

    );

  while (

    currentDate <= finalDate

  ) {

    const date =

      formatDate(

        currentDate,

      );

    const dailyPerformance =

      getDailyPerformance(

        account,

        accountEntries,

        accountCashFlows,

        date,

      );

    /*

     * If equity exists and is positive,

     * this is a valid daily period.

     *

     * A no-trade day naturally has 0% return.

     */

    if (

      dailyPerformance.returnPercentage !==

      null

    ) {

      growthFactor *=

        1 +

        dailyPerformance.returnPercentage /

          100;

      hasValidPerformancePeriod =

        true;

    } else if (

      dailyPerformance.pnl !==

      0

    ) {

      /*

       * Trading occurred but there was no

       * valid positive denominator.

       *

       * Do not silently skip that trade,

       * because doing so would produce a

       * misleading monthly return.

       */

      hasInvalidTradingDay =

        true;

    }

    currentDate.setDate(

      currentDate.getDate() +

        1,

    );

  }

  let returnPercentage:

    | number

    | null = null;

  if (

    !hasInvalidTradingDay &&

    hasValidPerformancePeriod

  ) {

    returnPercentage =

      (growthFactor - 1) *

      100;

  }

  return {

    startingEquity,

    deposits,

    withdrawals,

    netCashFlow,

    pnl: monthlyPnl,

    endingEquity,

    returnPercentage,

  };

}
