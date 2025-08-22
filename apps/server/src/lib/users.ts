import { env } from "~/env";

const addresses: string[] = [];

export const isUserWhitelisted = (address: string) => {
  if (env.STACKS_ENV === "testnet") return true;
  return addresses.includes(address);
};
