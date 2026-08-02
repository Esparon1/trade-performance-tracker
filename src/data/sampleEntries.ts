import type { PerformanceEntry } from "../types/entry";

export const sampleEntries: PerformanceEntry[] = [
  {
    id: "1",
    date: "2026-08-02",
    percentage: 1.2,
    amount: 800,
    notes: "Morning session",
  },
  {
    id: "2",
    date: "2026-08-02",
    percentage: -0.4,
    amount: -300,
    notes: "Small loss",
  },
  {
    id: "3",
    date: "2026-08-02",
    percentage: 0.7,
    amount: 1500,
    notes: "Evening session",
  },
  {
    id: "4",
    date: "2026-08-05",
    percentage: -0.8,
    amount: -450,
  },
  {
    id: "5",
    date: "2026-08-08",
    percentage: 2.1,
    amount: 1250,
  },
  {
    id: "6",
    date: "2026-08-12",
    percentage: -1.4,
    amount: -700,
  },
];