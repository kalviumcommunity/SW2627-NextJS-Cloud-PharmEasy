// Small date helpers shared by the scheduler, payment engine, and any page
// that needs to display or compute refill dates.

import { FREQUENCY } from "@/lib/utils/constants";

const FREQUENCY_TO_DAYS = {
  [FREQUENCY.DAILY]: 1,
  [FREQUENCY.WEEKLY]: 7,
  [FREQUENCY.MONTHLY]: 30, // simple 30-day cadence, matches subscription.service.js
};

/** Returns a new Date, `days` days after `date`. Does not mutate `date`. */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Advances a date by the interval implied by a subscription frequency
 * (DAILY / WEEKLY / MONTHLY). Falls back to a 30-day step for unknown values
 * so the scheduler never gets stuck on a malformed frequency.
 */
export function addIntervalForFrequency(date, frequency) {
  const days = FREQUENCY_TO_DAYS[frequency] ?? 30;
  return addDays(date, days);
}

/** True if `date` is at or before right now, i.e. a refill is due. */
export function isDue(date, now = new Date()) {
  return new Date(date).getTime() <= now.getTime();
}

/** Whole (rounded down) days between now and `date`. Negative if in the past. */
export function daysUntil(date, now = new Date()) {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((new Date(date).getTime() - now.getTime()) / msPerDay);
}

/** e.g. "9 Jul 2026" */
export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** e.g. "9 Jul 2026, 3:45 pm" */
export function formatDateTime(date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Friendly relative label for refill dates: "Today", "in 3 days", "5 days ago". */
export function formatRelativeToNow(date, now = new Date()) {
  const diff = daysUntil(date, now);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1) return `in ${diff} days`;
  return `${Math.abs(diff)} days ago`;
}