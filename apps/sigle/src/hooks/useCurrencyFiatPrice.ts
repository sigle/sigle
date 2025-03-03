import { useQuery } from "@tanstack/react-query";

export const allowedCurrencies = [
  { symbol: "STX", coingeckoId: "blockstack" },
  { symbol: "sBTC", coingeckoId: "sbtc-2" },
] as const;

export const formatUSDollar = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const useCurrencyFiatPrice = (
  currencySymbol?: (typeof allowedCurrencies)[number]["symbol"],
) => {
  return useQuery<number | null>({
    queryKey: ["get-fiat-price", currencySymbol],
    queryFn: async () => {
      const coingeckoId = allowedCurrencies.find(
        (c) => c.symbol === currencySymbol,
      )?.coingeckoId;
      if (!coingeckoId) return null;

      const data = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`,
      );
      const json = await data.json();
      return json[coingeckoId] ? json[coingeckoId].usd : null;
    },
    enabled: !!currencySymbol,
  });
};
