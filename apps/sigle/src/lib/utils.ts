const tokenFormatter = new Intl.NumberFormat("en-US", {});

export function formatNumber(rawNumber: number) {
  return tokenFormatter.format(rawNumber);
}

/**
 * The `message` of a failure: an `Error`, or the error body an
 * openapi-react-query mutation rejects with when the API answers an error.
 */
export function getErrorMessage(error: unknown): string | undefined {
  return typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
    ? error.message
    : undefined;
}
