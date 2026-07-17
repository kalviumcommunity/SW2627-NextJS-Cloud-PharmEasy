import { addIntervalForFrequency, isDue } from "@/lib/utils/date";

describe("addIntervalForFrequency", () => {
  it("adds 1 day for DAILY", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const result = addIntervalForFrequency(start, "DAILY");
    expect(result.toISOString()).toBe("2026-01-02T00:00:00.000Z");
  });

  it("adds 7 days for WEEKLY", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const result = addIntervalForFrequency(start, "WEEKLY");
    expect(result.toISOString()).toBe("2026-01-08T00:00:00.000Z");
  });

  it("adds 30 days for MONTHLY", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const result = addIntervalForFrequency(start, "MONTHLY");
    expect(result.toISOString()).toBe("2026-01-31T00:00:00.000Z");
  });

  it("falls back to 30 days for an unknown frequency", () => {
    const start = new Date("2026-01-01T00:00:00Z");
    const result = addIntervalForFrequency(start, "NOT_A_REAL_FREQUENCY");
    expect(result.toISOString()).toBe("2026-01-31T00:00:00.000Z");
  });
});

describe("isDue", () => {
  it("returns true when the date is in the past", () => {
    const now = new Date("2026-01-10T00:00:00Z");
    const past = new Date("2026-01-09T00:00:00Z");
    expect(isDue(past, now)).toBe(true);
  });

  it("returns false when the date is in the future", () => {
    const now = new Date("2026-01-10T00:00:00Z");
    const future = new Date("2026-01-11T00:00:00Z");
    expect(isDue(future, now)).toBe(false);
  });
});