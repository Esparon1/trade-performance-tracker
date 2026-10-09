

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
