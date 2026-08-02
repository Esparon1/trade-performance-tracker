export interface DailyEntry {
  id: string;
  date: string;

  percentage: number | null;
  amount: number | null;

  notes?: string;

  createdAt: string;
  updatedAt: string;
}   