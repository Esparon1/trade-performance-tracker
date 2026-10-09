import type { CashFlow } from "../../types/cashFlow";
import type { PerformanceEntry } from "../../types/entry";

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

export function getPnlForDate(

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

export function getPnlBetweenDates(

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

export function getCashFlowForDate(

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

export function getCashFlowBetweenDates(

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

export function getCashFlowTotalsBetweenDates(

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
