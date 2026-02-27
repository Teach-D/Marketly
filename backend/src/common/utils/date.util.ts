export const toDateStr = (d: Date): string => d.toISOString().slice(0, 10);
export const toMonthStr = (d: Date): string => d.toISOString().slice(0, 7);

export function buildDateRange(days: number): string[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    return toDateStr(d);
  });
}

export function buildMonthRange(months: number): string[] {
  return Array.from({ length: months }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (months - 1 - i));
    return toMonthStr(d);
  });
}
