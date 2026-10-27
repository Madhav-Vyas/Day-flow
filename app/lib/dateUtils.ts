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

