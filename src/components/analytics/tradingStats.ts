import type { PerformanceEntry } from "../../types/entry";

export interface TradingPerformanceStats {

  totalTrades: number;

  wins: number;

  losses: number;

  breakeven: number;

  winRate: number | null;

  grossProfit: number;

  grossLoss: number;

  profitFactor: number | null;

  averageWin: number | null;

  averageLoss: number | null;

  expectancy: number | null;

}


function isDateInRange(

  date: string,

  startDate: string | null,

  endDate: string,

): boolean {

  return (

    (startDate === null ||

      date >= startDate) &&

    date <= endDate

  );

}



export function getTradingPerformanceStats(

  entries: PerformanceEntry[],

  startDate: string | null,

  endDate: string,

): TradingPerformanceStats {

  const trades = entries.filter(

    (entry) =>

      entry.amount !== null &&

      Number.isFinite(entry.amount) &&

      isDateInRange(

        entry.date,

        startDate,

        endDate,

      ),

  );



  const wins = trades.filter(

    (entry) =>

      (entry.amount ?? 0) > 0,

  );



  const losses = trades.filter(

    (entry) =>

      (entry.amount ?? 0) < 0,

  );



  const breakeven =

    trades.length -

    wins.length -

    losses.length;



  const grossProfit = wins.reduce(

    (sum, entry) =>

      sum + (entry.amount ?? 0),

    0,

  );



  const grossLoss = losses.reduce(

    (sum, entry) =>

      sum + (entry.amount ?? 0),

    0,

  );



  const totalPnl = trades.reduce(

    (sum, entry) =>

      sum + (entry.amount ?? 0),

    0,

  );



  return {

    totalTrades: trades.length,

    wins: wins.length,

    losses: losses.length,

    breakeven,

    winRate:

      trades.length > 0

        ? (wins.length /

            trades.length) *

          100

        : null,

    grossProfit,

    grossLoss,

    profitFactor:

      grossLoss < 0

        ? grossProfit /

          Math.abs(grossLoss)

        : null,

    averageWin:

      wins.length > 0

        ? grossProfit /

          wins.length

        : null,

    averageLoss:

      losses.length > 0

        ? grossLoss /

          losses.length

        : null,

    expectancy:

      trades.length > 0

        ? totalPnl /

          trades.length

        : null,

  };

}
