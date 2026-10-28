import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

export type DateInput = Date | string | number | dayjs.Dayjs;

export function toSafeDayjs(date?: DateInput): dayjs.Dayjs {
  if (!date) return dayjs();
  const d = dayjs(date);
  return d.isValid() ? d : dayjs();
}

export function isValidDate(date?: DateInput): boolean {
  if (!date) return false;
  return dayjs(date).isValid();
}

/**
 * Returns Monday (start of ISO week) for the given date.
 */
export function getMonday(date?: DateInput): Date {
  return toSafeDayjs(date).startOf("isoWeek").toDate();
}

/**
 * Returns start of ISO week (Monday at 00:00:00.000).
 */
export function getStartOfWeek(date?: DateInput): Date {
  return toSafeDayjs(date).startOf("isoWeek").toDate();
}

/**
 * Returns end of ISO week (Sunday at 23:59:59.999).
 */
export function getEndOfWeek(date?: DateInput): Date {
  return toSafeDayjs(date).endOf("isoWeek").toDate();
}

/**
 * Adds the given number of days to a date.
 */
export function addDays(date: DateInput, days: number): Date {
  return dayjs(date).add(days, "day").toDate();
}

/**
 * Adds the given number of weeks to a date.
 */
export function addWeeks(date: DateInput, weeks: number): Date {
  return dayjs(date).add(weeks, "week").toDate();
}

/**
 * Formats a date for use in URLs (YYYY-MM-DD).
 */
export function formatDateForUrl(date: DateInput): string {
  return dayjs(date).format("YYYY-MM-DD");
}

/**
 * Formats a week range as "YYYY-MM-DD to YYYY-MM-DD" (Monday to Sunday).
 */
export function formatWeekRange(date: DateInput = new Date()): string {
  const monday = getMonday(date);
  const sunday = addDays(monday, 6);
  return `${formatDateForUrl(monday)} to ${formatDateForUrl(sunday)}`;
}

/**
 * Returns all 7 days of the ISO week (Monday through Sunday) as Date objects.
 */
export function getDaysInWeek(date: DateInput = new Date()): Date[] {
  const monday = getMonday(date);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/**
 * Checks if two dates fall on the same calendar day.
 */
export function isSameDay(dateA: DateInput, dateB: DateInput): boolean {
  return dayjs(dateA).isSame(dayjs(dateB), "day");
}
/**
 * Converts decimal hours back to hours and minutes (useful when editing).
 * Example: 2.33 -> { hours: 2, minutes: 20 }
 */
export function fromDecimalHours(decimal: number): {
  hours: number;
  minutes: number;
} {
  const totalMinutes = Math.round((Number(decimal) || 0) * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return { hours, minutes };
}

/**
 * Formats hours and minutes into clean human-readable text.
 * Example: 2, 20 -> "2h 20m"
 */
export function formatHoursMinutes(hours: number, minutes: number): string {
  const h = Number(hours) || 0;
  const m = Number(minutes) || 0;
  if (h === 0 && m === 0) return "0m";
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
/**
 * Converts human hours and minutes to decimal hours for the backend.
 * Formula: hours + (minutes / 60)
 * Example: 1h 30m -> 1.50
 * Example: 2h 20m -> 2.33
 */
export function toDecimalHours(
  hours: number | string,
  minutes: number | string,
): number {
  const h = Math.max(0, parseInt(String(hours), 10) || 0);
  const m = Math.max(0, Math.min(59, parseInt(String(minutes), 10) || 0));
  return parseFloat((h + m / 60).toFixed(2));
}

