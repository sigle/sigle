import { describe, expect, it } from "vite-plus/test";
import { InvalidDecimalNumberError } from "../errors/unit.js";
import { formatUnits, parseUnits } from "./unit.js";

describe(parseUnits, () => {
  it.each([
    ["1.5", 6, 1_500_000n],
    ["-0.120", 6, -120_000n],
    ["1.", 6, 1_000_000n],
    [".5", 2, 50n],
    ["1.005", 2, 101n],
    ["0.999", 2, 100n],
    ["12.5", 0, 13n],
  ])("parses %s with %i decimals", (value, decimals, expected) => {
    expect(parseUnits(value, decimals)).toBe(expected);
  });

  it.each(["1.2.3", "1e5", "--1"])("rejects %s", (value) => {
    expect(() => parseUnits(value, 6)).toThrow(InvalidDecimalNumberError);
  });

  // Inputs on which the previous regular expressions backtracked in quadratic
  // time, taking about a minute at this length.
  it("handles long runs of zeros in linear time", () => {
    const zeros = "0".repeat(200_000);

    expect(() => parseUnits(`${zeros}x`, 6)).toThrow(InvalidDecimalNumberError);
    expect(parseUnits(`${zeros}1`, 6)).toBe(1_000_000n);
    expect(parseUnits(`1.${zeros}1`, 6)).toBe(1_000_000n);
  });
});

describe(formatUnits, () => {
  it.each([
    [1_500_000n, 6, "1.5"],
    [-120_000n, 6, "-0.12"],
    [1_000_000n, 6, "1"],
    [5n, 0, "5"],
  ])("formats %s with %i decimals", (value, decimals, expected) => {
    expect(formatUnits(value, decimals)).toBe(expected);
  });
});
