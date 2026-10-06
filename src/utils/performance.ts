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

 * Deposit                = 5,000

 * Starting trading equity = 16,000

 * Trading P/L             = +800

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

 *   Trading P/L only.

 *

 * Cash flows:

 *   Reported separately.

 *

 * Monthly return:

 *   Time-weighted return using compounded

 *   daily trading returns.

 *

 *   (1 + day1)

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

/*
 * =========================================================
 * ANALYTICS / KPI ENGINE
 * =========================================================
 *
 * These helpers power the Analytics view.
 *
 * Important:
 * - Cash flows change account equity, but are NOT trading P/L.
 * - Period returns use compounded daily time-weighted returns.
 * - Drawdown is calculated from a cash-flow-neutral performance
 *   index, not raw account equity. This prevents withdrawals from
 *   looking like trading losses and deposits from looking like gains.
 */

export type PerformanceRange =
  | "1M"
  | "3M"
  | "6M"
  | "YTD"
  | "1Y"
  | "ALL";

export interface EquityCurvePoint {
  date: string;
  equity: number;
  pnl: number;
  cashFlow: number;
  returnPercentage: number | null;
}

export interface DrawdownCurvePoint {
  date: string;
  performanceIndex: number;
  peakPerformanceIndex: number;
  drawdownPercentage: number;
}

export interface PerformanceKpis {
  range: PerformanceRange;
  startDate: string | null;
  endDate: string;

  currentEquity: number | null;
  totalPnl: number;

  returnPercentage: number | null;

  peakEquity: number | null;

  currentDrawdownPercentage: number | null;
  maxDrawdownPercentage: number | null;
}

function addDays(
  date: string,
  days: number,
): string {
  const result = createLocalDate(date);

  result.setDate(
    result.getDate() + days,
  );

  return formatDate(result);
}

function subtractMonths(
  date: string,
  months: number,
): string {
  const source = createLocalDate(date);

  const originalDay =
    source.getDate();

  const target = new Date(
    source.getFullYear(),
    source.getMonth() - months,
    1,
  );

  const lastDayOfTargetMonth =
    new Date(
      target.getFullYear(),
      target.getMonth() + 1,
      0,
    ).getDate();

  target.setDate(
    Math.min(
      originalDay,
      lastDayOfTargetMonth,
    ),
  );

  return formatDate(target);
}

function subtractYears(
  date: string,
  years: number,
): string {
  const source = createLocalDate(date);

  const target = new Date(
    source.getFullYear() - years,
    source.getMonth(),
    1,
  );

  const lastDayOfTargetMonth =
    new Date(
      target.getFullYear(),
      target.getMonth() + 1,
      0,
    ).getDate();

  target.setDate(
    Math.min(
      source.getDate(),
      lastDayOfTargetMonth,
    ),
  );

  return formatDate(target);
}

function clampStartDateToAccount(
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

export function getRangeStartDate(
  account: Account,
  range: PerformanceRange,
  endDate: string,
): string | null {
  if (
    !hasValidStartingPoint(account) ||
    account.startingDate === null
  ) {
    return null;
  }

  let requestedStartDate: string;

  switch (range) {
    case "1M":
      requestedStartDate =
        subtractMonths(
          endDate,
          1,
        );
      break;

    case "3M":
      requestedStartDate =
        subtractMonths(
          endDate,
          3,
        );
      break;

    case "6M":
      requestedStartDate =
        subtractMonths(
          endDate,
          6,
        );
      break;

    case "YTD": {
      const end =
        createLocalDate(
          endDate,
        );

      requestedStartDate =
        formatDate(
          new Date(
            end.getFullYear(),
            0,
            1,
          ),
        );
      break;
    }

    case "1Y":
      requestedStartDate =
        subtractYears(
          endDate,
          1,
        );
      break;

    case "ALL":
      requestedStartDate =
        account.startingDate;
      break;
  }

  return clampStartDateToAccount(
    account,
    requestedStartDate,
  );
}

export function getCurrentEquity(
  account: Account,
  entries: PerformanceEntry[],
  cashFlows: CashFlow[],
  asOfDate: string,
): number | null {
  if (
    !hasValidStartingPoint(account) ||
    account.startingDate === null ||
    asOfDate < account.startingDate
  ) {
    return null;
  }

  return getDailyPerformance(
    account,
    entries,
    cashFlows,
    asOfDate,
  ).endingEquity;
}

export function getEquityCurve(
  account: Account,
  entries: PerformanceEntry[],
  cashFlows: CashFlow[],
  startDate: string,
  endDate: string,
): EquityCurvePoint[] {
  if (
    !hasValidStartingPoint(account) ||
    account.startingDate === null ||
    endDate < account.startingDate ||
    startDate > endDate
  ) {
    return [];
  }

  const calculationStart =
    clampStartDateToAccount(
      account,
      startDate,
    );

  if (calculationStart === null) {
    return [];
  }

  const points: EquityCurvePoint[] =
    [];

  let currentDate =
    calculationStart;

  while (
    currentDate <= endDate
  ) {
    const daily =
      getDailyPerformance(
        account,
        entries,
        cashFlows,
        currentDate,
      );

    if (
      daily.endingEquity !==
      null
    ) {
      points.push({
        date: currentDate,
        equity:
          daily.endingEquity,
        pnl: daily.pnl,
        cashFlow:
          daily.cashFlow,
        returnPercentage:
          daily.returnPercentage,
      });
    }

    currentDate =
      addDays(
        currentDate,
        1,
      );
  }

  return points;
}

export function getTimeWeightedReturnBetweenDates(
  account: Account,
  entries: PerformanceEntry[],
  cashFlows: CashFlow[],
  startDate: string,
  endDate: string,
): number | null {
  if (
    !hasValidStartingPoint(account) ||
    account.startingDate === null ||
    startDate > endDate ||
    endDate < account.startingDate
  ) {
    return null;
  }

  const calculationStart =
    clampStartDateToAccount(
      account,
      startDate,
    );

  if (calculationStart === null) {
    return null;
  }

  let growthFactor = 1;
  let hasValidPerformancePeriod =
    false;
  let hasInvalidTradingDay =
    false;

  let currentDate =
    calculationStart;

  while (
    currentDate <= endDate
  ) {
    const daily =
      getDailyPerformance(
        account,
        entries,
        cashFlows,
        currentDate,
      );

    if (
      daily.returnPercentage !==
      null
    ) {
      growthFactor *=
        1 +
        daily.returnPercentage /
          100;

      hasValidPerformancePeriod =
        true;
    } else if (
      daily.pnl !== 0
    ) {
      hasInvalidTradingDay =
        true;
    }

    currentDate =
      addDays(
        currentDate,
        1,
      );
  }

  if (
    hasInvalidTradingDay ||
    !hasValidPerformancePeriod
  ) {
    return null;
  }

  return (
    (growthFactor - 1) *
    100
  );
}

export function getDrawdownCurve(
  account: Account,
  entries: PerformanceEntry[],
  cashFlows: CashFlow[],
  startDate: string,
  endDate: string,
): DrawdownCurvePoint[] {
  if (
    !hasValidStartingPoint(account) ||
    account.startingDate === null ||
    startDate > endDate ||
    endDate < account.startingDate
  ) {
    return [];
  }

  const calculationStart =
    clampStartDateToAccount(
      account,
      startDate,
    );

  if (calculationStart === null) {
    return [];
  }

  const points: DrawdownCurvePoint[] =
    [];

  let performanceIndex = 100;
  let peakPerformanceIndex = 100;

  let currentDate =
    calculationStart;

  while (
    currentDate <= endDate
  ) {
    const daily =
      getDailyPerformance(
        account,
        entries,
        cashFlows,
        currentDate,
      );

    if (
      daily.returnPercentage !==
      null
    ) {
      performanceIndex *=
        1 +
        daily.returnPercentage /
          100;

      peakPerformanceIndex =
        Math.max(
          peakPerformanceIndex,
          performanceIndex,
        );

      const drawdownPercentage =
        peakPerformanceIndex > 0
          ? ((performanceIndex -
                peakPerformanceIndex) /
              peakPerformanceIndex) *
            100
          : 0;

      points.push({
        date: currentDate,
        performanceIndex,
        peakPerformanceIndex,
        drawdownPercentage,
      });
    }

    currentDate =
      addDays(
        currentDate,
        1,
      );
  }

  return points;
}

export function getPerformanceKpis(
  account: Account,
  entries: PerformanceEntry[],
  cashFlows: CashFlow[],
  range: PerformanceRange,
  endDate: string,
): PerformanceKpis {
  const startDate =
    getRangeStartDate(
      account,
      range,
      endDate,
    );

  if (
    startDate === null ||
    account.startingDate === null
  ) {
    return {
      range,
      startDate: null,
      endDate,
      currentEquity: null,
      totalPnl: 0,
      returnPercentage: null,
      peakEquity: null,
      currentDrawdownPercentage:
        null,
      maxDrawdownPercentage:
        null,
    };
  }

  const accountEntries =
    getAccountEntries(
      account,
      entries,
    );

  const totalPnl =
    getPnlBetweenDates(
      accountEntries,
      startDate,
      endDate,
    );

  const currentEquity =
    getCurrentEquity(
      account,
      accountEntries,
      cashFlows,
      endDate,
    );

  const returnPercentage =
    getTimeWeightedReturnBetweenDates(
      account,
      accountEntries,
      cashFlows,
      startDate,
      endDate,
    );

  const equityCurve =
    getEquityCurve(
      account,
      accountEntries,
      cashFlows,
      startDate,
      endDate,
    );

  const peakEquity =
    equityCurve.length > 0
      ? equityCurve.reduce(
          (
            highest,
            point,
          ) =>
            Math.max(
              highest,
              point.equity,
            ),
          equityCurve[0].equity,
        )
      : null;

  const drawdownCurve =
    getDrawdownCurve(
      account,
      accountEntries,
      cashFlows,
      startDate,
      endDate,
    );

  const currentDrawdownPercentage =
    drawdownCurve.length > 0
      ? drawdownCurve[
          drawdownCurve.length - 1
        ].drawdownPercentage
      : null;

  const maxDrawdownPercentage =
    drawdownCurve.length > 0
      ? drawdownCurve.reduce(
          (
            lowest,
            point,
          ) =>
            Math.min(
              lowest,
              point.drawdownPercentage,
            ),
          0,
        )
      : null;

  return {
    range,
    startDate,
    endDate,
    currentEquity,
    totalPnl,
    returnPercentage,
    peakEquity,
    currentDrawdownPercentage,
    maxDrawdownPercentage,
  };
}

