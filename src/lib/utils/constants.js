// Central place for enum-like values and shared config so the frontend and
// backend never drift out of sync with prisma/schema.prisma. Values here are
// plain strings (not imported from @prisma/client) so this file is safe to
// import from client components too.

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
};

export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.SUCCESS]: "Delivered",
  [ORDER_STATUS.FAILED]: "Failed",
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

// Badge color hints for UI components (Kavya/Somya's pages can map these to
// their design system without re-inventing a status->color table).
export const STATUS_BADGE_COLOR = {
  [SUBSCRIPTION_STATUS.ACTIVE]: "green",
  [SUBSCRIPTION_STATUS.PAUSED]: "amber",
  [SUBSCRIPTION_STATUS.CANCELLED]: "gray",
  [ORDER_STATUS.PENDING]: "amber",
  [ORDER_STATUS.SUCCESS]: "green",
  [ORDER_STATUS.FAILED]: "red",
  [PAYMENT_STATUS.SUCCESS]: "green",
  [PAYMENT_STATUS.FAILED]: "red",
  [PAYMENT_STATUS.RETRYING]: "amber",
};

export const NOTIFICATION_TYPE = {
  REFILL_REMINDER: "REFILL_REMINDER",
  PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
  PAYMENT_FAILED: "PAYMENT_FAILED",
  ORDER_FAILED: "ORDER_FAILED",
};

// --- Payment engine tuning ---

// Maximum number of RETRY attempts allowed after the first attempt fails.
// retryCount on a Payment row is 0-indexed (0 = original attempt), so a
// Payment can be created with retryCount 0, 1, 2, 3 (1 original + 3 retries)
// before the order is permanently marked FAILED.
export const MAX_PAYMENT_RETRIES = 3;

// How long to wait before each retry after a failed attempt.
// Index 0 = delay before retry #1 (after the 1st failure), index 1 = delay
// before retry #2, etc. Length should match MAX_PAYMENT_RETRIES.
export const PAYMENT_RETRY_BACKOFF_MS = [
  60 * 60 * 1000,       // 1 hour
  4 * 60 * 60 * 1000,   // 4 hours
  24 * 60 * 60 * 1000,  // 24 hours
];

// Probability that a non-forced (scheduler-driven) payment attempt succeeds.
export const PAYMENT_SUCCESS_PROBABILITY = 0.7;

// Header used to authorize the scheduler trigger endpoint.
export const SCHEDULER_AUTH_HEADER = "authorization";