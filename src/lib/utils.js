// Central place for enum-like values, configuration, and date utilities

export const FREQUENCY = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
};

export const FREQUENCY_LABEL = {
  [FREQUENCY.DAILY]: "Daily",
  [FREQUENCY.WEEKLY]: "Weekly",
  [FREQUENCY.MONTHLY]: "Monthly",
};

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  CANCELLED: "CANCELLED",
};

export const SUBSCRIPTION_STATUS_LABEL = {
  [SUBSCRIPTION_STATUS.ACTIVE]: "Active",
  [SUBSCRIPTION_STATUS.PAUSED]: "Paused",
  [SUBSCRIPTION_STATUS.CANCELLED]: "Cancelled",
};

export const ORDER_STATUS = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
};

export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.SUCCESS]: "Delivered",
  [ORDER_STATUS.FAILED]: "Failed",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
};

export const PAYMENT_STATUS = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  RETRYING: "RETRYING",
};

export const PAYMENT_STATUS_LABEL = {
  [PAYMENT_STATUS.SUCCESS]: "Success",
  [PAYMENT_STATUS.FAILED]: "Failed",
  [PAYMENT_STATUS.RETRYING]: "Retrying",
};

// Badge color hints for UI components
export const STATUS_BADGE_COLOR = {
  [SUBSCRIPTION_STATUS.ACTIVE]: "green",
  [SUBSCRIPTION_STATUS.PAUSED]: "amber",
  [SUBSCRIPTION_STATUS.CANCELLED]: "gray",
  [ORDER_STATUS.PENDING]: "amber",
  [ORDER_STATUS.SUCCESS]: "green",
  [ORDER_STATUS.FAILED]: "red",
  [ORDER_STATUS.CANCELLED]: "gray",
  [PAYMENT_STATUS.SUCCESS]: "green",
  [PAYMENT_STATUS.FAILED]: "red",
  [PAYMENT_STATUS.RETRYING]: "amber",
};
export const NOTIFICATION_TYPE = {
  REFILL_REMINDER: "REFILL_REMINDER",
  REFILL_SKIPPED: "REFILL_SKIPPED",
  PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  ORDER_FAILED: "ORDER_FAILED",
};

// --- Payment engine tuning ---

// Maximum number of RETRY attempts allowed after the first attempt fails.
export const MAX_PAYMENT_RETRIES = 3;

// How long to wait before each retry after a failed attempt.
export const PAYMENT_RETRY_BACKOFF_MS = [
  60 * 60 * 1000,       // 1 hour
  4 * 60 * 60 * 1000,   // 4 hours
  24 * 60 * 60 * 1000,  // 24 hours
];

// Probability that a non-forced (scheduler-driven) payment attempt succeeds.
export const PAYMENT_SUCCESS_PROBABILITY = 0.7;

// Header used to authorize the scheduler trigger endpoint.
export const SCHEDULER_AUTH_HEADER = "authorization";


// --- Date Utilities ---

const FREQUENCY_TO_DAYS = {
  [FREQUENCY.DAILY]: 1,
  [FREQUENCY.WEEKLY]: 7,
  [FREQUENCY.MONTHLY]: 30, // simple 30-day cadence
};

/** Returns a new Date, `days` days after `date`. Does not mutate `date`. */
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Advances a date by the interval implied by a subscription frequency
 * (DAILY / WEEKLY / MONTHLY). Falls back to a 30-day step for unknown values.
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
