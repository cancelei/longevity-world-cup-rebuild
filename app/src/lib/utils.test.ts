import { describe, it, expect } from "vitest";
import {
  cn,
  formatAge,
  formatAgeReduction,
  calculatePaceOfAging,
  formatPaceOfAging,
  formatDate,
  formatCurrency,
  formatBTC,
  truncateAddress,
  getGenerationFromBirthYear,
} from "./utils";

describe("cn (class name utility)", () => {
  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("handles undefined and null", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar");
  });

  it("merges tailwind classes correctly", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });
});

describe("formatAge", () => {
  it("formats age with one decimal place", () => {
    expect(formatAge(35.678)).toBe("35.7");
    expect(formatAge(40)).toBe("40.0");
    expect(formatAge(25.1)).toBe("25.1");
  });
});

describe("formatAgeReduction", () => {
  it("shows negative reduction when biological < chronological", () => {
    expect(formatAgeReduction(50, 45)).toBe("-5.0 years");
  });

  it("shows positive when biological > chronological", () => {
    expect(formatAgeReduction(50, 55)).toBe("+5.0 years");
  });

  it("shows zero reduction correctly", () => {
    expect(formatAgeReduction(50, 50)).toBe("-0.0 years");
  });
});

describe("calculatePaceOfAging", () => {
  it("calculates pace correctly", () => {
    expect(calculatePaceOfAging(50, 45)).toBe(0.9);
    expect(calculatePaceOfAging(50, 50)).toBe(1);
    expect(calculatePaceOfAging(50, 55)).toBe(1.1);
  });
});

describe("formatPaceOfAging", () => {
  it("formats pace as percentage", () => {
    expect(formatPaceOfAging(0.9)).toBe("90%");
    expect(formatPaceOfAging(1)).toBe("100%");
    expect(formatPaceOfAging(0.85)).toBe("85%");
  });
});

describe("formatDate", () => {
  it("formats Date objects", () => {
    // Use explicit time to avoid timezone issues
    const date = new Date("2024-01-15T12:00:00");
    expect(formatDate(date)).toBe("Jan 15, 2024");
  });

  it("formats date strings with time", () => {
    expect(formatDate("2024-06-20T12:00:00")).toBe("Jun 20, 2024");
  });
});

describe("formatCurrency", () => {
  it("formats USD by default", () => {
    expect(formatCurrency(1000)).toBe("$1,000");
    expect(formatCurrency(1500000)).toBe("$1,500,000");
  });

  it("handles different currencies", () => {
    expect(formatCurrency(1000, "EUR")).toBe("\u20ac1,000");
    expect(formatCurrency(1000, "GBP")).toBe("\u00a31,000");
  });
});

describe("formatBTC", () => {
  it("formats BTC with 4 decimal places", () => {
    expect(formatBTC(1.5)).toBe("1.5000 BTC");
    expect(formatBTC(0.12345678)).toBe("0.1235 BTC");
  });
});

describe("truncateAddress", () => {
  it("truncates long addresses", () => {
    const address = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
    // Default is 6 chars from start and end
    expect(truncateAddress(address)).toBe("bc1qxy...hx0wlh");
    expect(truncateAddress(address, 4)).toBe("bc1q...0wlh");
  });
});

describe("getGenerationFromBirthYear", () => {
  it("identifies Gen Alpha", () => {
    expect(getGenerationFromBirthYear(2020)).toBe("Gen Alpha");
    expect(getGenerationFromBirthYear(2013)).toBe("Gen Alpha");
  });

  it("identifies Gen Z", () => {
    expect(getGenerationFromBirthYear(2000)).toBe("Gen Z");
    expect(getGenerationFromBirthYear(1997)).toBe("Gen Z");
  });

  it("identifies Millennials", () => {
    expect(getGenerationFromBirthYear(1990)).toBe("Millennial");
    expect(getGenerationFromBirthYear(1981)).toBe("Millennial");
  });

  it("identifies Gen X", () => {
    expect(getGenerationFromBirthYear(1975)).toBe("Gen X");
    expect(getGenerationFromBirthYear(1965)).toBe("Gen X");
  });

  it("identifies Baby Boomers", () => {
    expect(getGenerationFromBirthYear(1955)).toBe("Baby Boomer");
    expect(getGenerationFromBirthYear(1946)).toBe("Baby Boomer");
  });

  it("identifies Silent Generation", () => {
    expect(getGenerationFromBirthYear(1940)).toBe("Silent Generation");
    expect(getGenerationFromBirthYear(1930)).toBe("Silent Generation");
  });
});
