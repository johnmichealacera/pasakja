import { format, startOfMonth, startOfWeek, subMonths } from "date-fns";
import { tz } from "@date-fns/tz";

/** Philippines timezone (UTC+8). All user-facing dates use this. */
export const PH_TIMEZONE = "Asia/Manila";

const phIn = tz(PH_TIMEZONE);

type DateInput = Date | string | number;

/** Format a timestamp for display in Philippines time. */
export function formatPh(date: DateInput, pattern: string): string {
  return format(date, pattern, { in: phIn });
}

/** Start of the current calendar month in Philippines time (for DB range queries). */
export function startOfMonthPh(date: DateInput = new Date()): Date {
  return startOfMonth(date, { in: phIn });
}

/** Start of the current calendar week in Philippines time (for DB range queries). */
export function startOfWeekPh(date: DateInput = new Date()): Date {
  return startOfWeek(date, { in: phIn });
}

/** Subtract months relative to Philippines calendar boundaries. */
export function subMonthsPh(date: DateInput, amount: number): Date {
  return subMonths(date, amount, { in: phIn });
}

/** Format time only in Philippines timezone (e.g. refresh labels). */
export function formatPhTime(
  date: DateInput = new Date(),
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: PH_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    ...options,
  }).format(new Date(date));
}
