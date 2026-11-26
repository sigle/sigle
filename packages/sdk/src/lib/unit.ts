import { InvalidDecimalNumberError } from "../errors/unit.js";

const STACKS_DECIMALS = 6;

const BTC_DECIMALS = 8;

/**
 * `value` without its trailing zeros. A loop rather than `/0+$/`, which takes
 * quadratic time on a long run of zeros that doesn't end the string.
 */
const trimTrailingZeros = (value: string) => {
  let end = value.length;

  while (end > 0 && value[end - 1] === "0") {
    end--;
  }

  return value.slice(0, end);
};

/**
 * https://github.com/wevm/viem/blob/d0275721a89d0d803e907041d4d16e7f9818bfba/src/utils/unit/parseUnits.ts
 *
 * Multiplies a string representation of a number by a given exponent of base 10 (10exponent).
 */
export function parseUnits(value: string, decimals: number): bigint {
  // Digits only after the dot: `[0-9]*\.?[0-9]*` could split a run of digits
  // many ways and backtrack in quadratic time on long invalid input.
  if (!/^-?\d*(?:\.\d*)?$/.test(value)) {
    throw new InvalidDecimalNumberError({ value });
  }

  let [integer, fraction = "0"] = value.split(".");

  const negative = integer.startsWith("-");

  if (negative) {
    integer = integer.slice(1);
  }

  // trim trailing zeros.
  fraction = trimTrailingZeros(fraction);

  // round off if the fraction is larger than the number of decimals.
  if (decimals === 0) {
    if (Math.round(Number(`.${fraction}`)) === 1) {
      integer = `${BigInt(integer) + 1n}`;
    }
    fraction = "";
  } else if (fraction.length > decimals) {
    const [left, unit, right] = [
      fraction.slice(0, decimals - 1),
      fraction.slice(decimals - 1, decimals),
      fraction.slice(decimals),
    ];

    const rounded = Math.round(Number(`${unit}.${right}`));

    if (rounded > 9) {
      fraction = `${BigInt(left) + BigInt(1)}0`.padStart(left.length + 1, "0");
    } else {
      fraction = `${left}${rounded}`;
    }

    if (fraction.length > decimals) {
      fraction = fraction.slice(1);
      integer = `${BigInt(integer) + 1n}`;
    }

    fraction = fraction.slice(0, decimals);
  } else {
    fraction = fraction.padEnd(decimals, "0");
  }

  return BigInt(`${negative ? "-" : ""}${integer}${fraction}`);
}

/**
 * https://github.com/wevm/viem/blob/d0275721a89d0d803e907041d4d16e7f9818bfba/src/utils/unit/formatUnits.ts
 *
 *  Divides a number by a given exponent of base 10 (10exponent), and formats it into a string representation of the number.
 */
export function formatUnits(value: bigint, decimals: number) {
  let display = value.toString();

  const negative = display.startsWith("-");

  if (negative) {
    display = display.slice(1);
  }

  display = display.padStart(decimals, "0");

  const integer = display.slice(0, display.length - decimals);
  const fraction = trimTrailingZeros(display.slice(display.length - decimals));

  return `${negative ? "-" : ""}${integer || "0"}${fraction ? `.${fraction}` : ""}`;
}

/**
 * Converts a string representation of STX to uSTX.
 */
export function parseSTX(ether: string) {
  return parseUnits(ether, STACKS_DECIMALS);
}

/**
 * Converts numerical uSTX to a string representation of STX.
 */
export function formatSTX(uSTX: bigint) {
  return formatUnits(uSTX, STACKS_DECIMALS);
}

/**
 * Converts a string representation of BTC to satoshis.
 */
export function parseBTC(bitcoin: string) {
  return parseUnits(bitcoin, BTC_DECIMALS);
}

/**
 * Converts numerical satoshis to a string representation of BTC.
 */
export function formatBTC(sats: bigint) {
  return formatUnits(sats, BTC_DECIMALS);
}
