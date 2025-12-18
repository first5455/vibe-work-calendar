import { describe, test, expect, beforeAll } from "bun:test";

describe("Example Test Suite", () => {
  beforeAll(() => {
    // Setup code here
  });

  test("basic arithmetic", () => {
    expect(2 + 2).toBe(4);
  });

  test("string operations", () => {
    expect("hello".toUpperCase()).toBe("HELLO");
  });
});

// Example: Testing a simple function
function calculateLeavedays(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end dates
}

describe("calculateLeaveDays", () => {
  test("calculates days correctly for same day", () => {
    const date = new Date("2024-01-15");
    expect(calculateLeavedays(date, date)).toBe(1);
  });

  test("calculates days correctly for multiple days", () => {
    const start = new Date("2024-01-15");
    const end = new Date("2024-01-19");
    expect(calculateLeavedays(start, end)).toBe(5);
  });
});
