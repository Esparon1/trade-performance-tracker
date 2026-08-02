export function formatPercentage(value: number): string {
  const sign = value > 0 ? "+" : "";

  return `${sign}${Number(value.toFixed(1))}%`;
}

export function formatAmount(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";

  return `${sign}$${Math.abs(value).toLocaleString("en-CA", {
    maximumFractionDigits: 0,
  })}`;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}