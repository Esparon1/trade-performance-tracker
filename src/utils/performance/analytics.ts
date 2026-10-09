import type { Account } from "../../types/account";
import type { CashFlow } from "../../types/cashFlow";
import type { PerformanceEntry } from "../../types/entry";
import type { PerformanceRange, EquityCurvePoint, DrawdownCurvePoint, PerformanceKpis } from "./types";
import { createLocalDate, formatDate, addDays, subtractMonths, subtractYears } from "./dates";
import { getAccountEntries, hasValidStartingPoint, clampStartDateToAccount } from "./accountData";
import { getPnlBetweenDates } from "./transactions";
import { getDailyPerformance } from "./daily";

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
