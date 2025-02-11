export class InvalidDecimalNumberError extends Error {
  name = "InvalidDecimalNumberError";
  constructor({ value }: { value: string }) {
    super(`Number \`${value}\` is not a valid decimal number.`);
  }
}
