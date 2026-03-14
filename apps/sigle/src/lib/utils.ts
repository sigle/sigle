const tokenFormatter = new Intl.NumberFormat("en-US", {});

export function formatNumber(rawNumber: number) {
  return tokenFormatter.format(rawNumber);
}
