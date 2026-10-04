import type {
  Account,
} from "../types/account";

import type {
  CashFlow,
} from "../types/cashFlow";

import type {
  PerformanceEntry,
} from "../types/entry";

export interface DailyPerformance {
  date: string;
  startingEquity: number | null;
  cashFlow: number;
  pnl: number;
  endingEquity: number | null;
  returnPercentage: number | null;
}

export interface MonthlyPerformance {
  startingEquity: number | null;
  deposits: number;
  withdrawals: number;
  netCashFlow: number;
  pnl: number;
  endingEquity: number | null;
  returnPercentage: number | null;
}

/*
 * =========================================================
 * DATE HELPERS
 * =========================================================
 */

function formatDate(
  date: Date,
): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(
    2,
    "0",
  );

  const day = String(
    date.getDate(),
  ).padStart(
    2,
    "0",
  );

  return `${year}-${month}-${day}`;
}

function createLocalDate(
  date: string,
): Date {
  const [
    year,
    month,
    day,
  ] = date
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day,
  );
}

function getMonthStartDate(
  year: number,
  month: number,
): string {
  return formatDate(
    new Date(
      year,
      month,
      1,
    ),
  );
}

function getMonthEndDate(
  year: number,
  month: number,
): string {
  return formatDate(
    new Date(
      year,
      month + 1,
      0,
    ),
  );
}

/*
 * =========================================================
 * ACCOUNT DATA
 * =========================================================
 */

function getAccountEntries(
  account: Account,
  entries: PerformanceEntry[],
): PerformanceEntry[] {
  return entries.filter(
    (entry) =>
      entry.accountId ===
      account.id,
  );
}

function getAccountCashFlows(
  account: Account,
  cashFlows: CashFlow[],
): CashFlow[] {
  return cashFlows.filter(
    (cashFlow) =>
      cashFlow.accountId ===
      account.id,
  );
}

/*
 * =========================================================
 * P/L
 * =========================================================
 */

function getEntryAmount(
  entry: PerformanceEntry,
): number {
  if (
    entry.amount === null ||
    !Number.isFinite(
      entry.amount,
    )
  ) {
    return 0;
  }

  return entry.amount;
}

function getPnlForDate(
  entries: PerformanceEntry[],
  date: string,
): number {
  return entries.reduce(
    (
      total,
      entry,
    ) => {
      if (
        entry.date !== date
      ) {
        return total;
      }

      return (
        total +
        getEntryAmount(
          entry,
        )
      );
    },
    0,
  );
}

function getPnlBetweenDates(
  entries: PerformanceEntry[],
  startDate: string,
  endDate: string,
): number {
  return entries.reduce(
    (
      total,
      entry,
    ) => {
      if (
        entry.date <
          startDate ||
        entry.date >
          endDate
      ) {
        return total;
      }

      return (
        total +
        getEntryAmount(
          entry,
        )
      );
    },
    0,
  );
}

/*
 * =========================================================
 * CASH FLOW
 * =========================================================
 */

function getSignedCashFlow(
  cashFlow: CashFlow,
): number {
  if (
    cashFlow.type ===
    "deposit"
  ) {
    return cashFlow.amount;
  }

  return -cashFlow.amount;
}

function getCashFlowForDate(
  cashFlows: CashFlow[],
  date: string,
): number {
  return cashFlows.reduce(
    (
      total,
      cashFlow,
    ) => {
      if (
        cashFlow.date !== date
      ) {
        return total;
      }

      return (
        total +
        getSignedCashFlow(
          cashFlow,
        )
      );
    },
    0,
  );
}

function getCashFlowBetweenDates(
  cashFlows: CashFlow[],
  startDate: string,
  endDate: string,
): number {
  return cashFlows.reduce(
    (
      total,
      cashFlow,
    ) => {
      if (
        cashFlow.date <
          startDate ||
        cashFlow.date >
          endDate
      ) {
        return total;
      }

      return (
        total +
        getSignedCashFlow(
          cashFlow,
        )
      );
    },
    0,
  );
}

function getCashFlowTotalsBetweenDates(
  cashFlows: CashFlow[],
  startDate: string,
  endDate: string,
): {
  deposits: number;
  withdrawals: number;
} {
  return cashFlows.reduce(
    (
      totals,
      cashFlow,
    ) => {
      if (
        cashFlow.date <
          startDate ||
        cashFlow.date >
          endDate
      ) {
        return totals;
      }

      if (
        cashFlow.type ===
        "deposit"
      ) {
        totals.deposits +=
          cashFlow.amount;
      } else {
        totals.withdrawals +=
          cashFlow.amount;
      }

      return totals;
    },
    {
      deposits: 0,
      withdrawals: 0,
    },
  );
}

/*
 * =========================================================
 * ACCOUNT CALCULATION START
 * =========================================================
 */

function hasValidStartingPoint(
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

/*
 * =========================================================
 * EQUITY BEFORE A DATE
 *
 * This is the previous day's closing equity.
 *
 * Same-day cash flow is intentionally NOT included here.
 * It gets applied at the beginning of the requested day.
 * =========================================================
 */

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

/*
 * =========================================================
 * DAILY PERFORMANCE
 *
 * Cash flows happen at START OF DAY.
 *
 * Example:
 *
 * Previous closing equity = 11,000
 * Deposit                = 5,000
 * Starting trading equity = 16,000
 * Trading P/L             = +800
 *
 * Daily return = 800 / 16,000 = +5%
 * Ending equity = 16,800
 * =========================================================
 */

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

/*
 * =========================================================
 * MONTHLY PERFORMANCE
 *
 * Monthly P/L:
 *   Trading P/L only.
 *
 * Cash flows:
 *   Reported separately.
 *
 * Monthly return:
 *   Time-weighted return using compounded
 *   daily trading returns.
 *
 *   (1 + day1)
 * × (1 + day2)
 * × ...
 * - 1
 *
 * This prevents deposits/withdrawals from
 * being mistaken for investment performance.
 * =========================================================
 */

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