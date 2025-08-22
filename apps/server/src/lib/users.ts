import { env } from "~/env";

const addresses =
  env.STACKS_ENV === "mainnet"
    ? []
    : ["ST1MPBXQMVM63FSWM55Z2EQP1NKHB3P0RP13APXCP"];

export const isUserWhitelisted = (address: string) => {
  return addresses.includes(address);
};
