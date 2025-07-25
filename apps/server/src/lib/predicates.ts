import type { Predicate } from "@hirosystems/chainhook-client";
import { sigleConfig } from "@sigle/sdk";
import { env } from "~/env";

/**
 * Predicate listing for all contracts deployed on the network.
 * Once chainhooks support specifying contracts implementing a trait, we can update this predicate
 * to be more performant.
 */
export const contractDeploymentPredicate = {
  name: "contract-deployment",
  chain: "stacks",
  version: 1,
  networks: {
    testnet: {
      if_this: {
        scope: "contract_deployment",
        deployer: "*",
      },
      then_that: {
        http_post: {
          url: "{__BASE_URL__}/api/chainhook/webhook",
          authorization_header: "Bearer {__TOKEN__}",
        },
      },
      // TODO start_block depending on env.STACKS_ENV
      start_block: 952455,
      decode_clarity_values: true,
    },
  },
} satisfies Omit<Predicate, "uuid">;

export const sigleProfilesPredicate = {
  name: "sigle-profiles",
  chain: "stacks",
  version: 1,
  networks: {
    testnet: {
      if_this: {
        scope: "print_event",
        contains: "set-profile",
        contract_identifier: `${
          sigleConfig[env.STACKS_ENV].protocolAddress
        }.sigle-profiles-v001`,
      },
      then_that: {
        http_post: {
          url: "{__BASE_URL__}/api/chainhook/webhook",
          authorization_header: "Bearer {__TOKEN__}",
        },
      },
      // TODO start_block depending on env.STACKS_ENV
      start_block: 952455,
      decode_clarity_values: true,
    },
  },
} satisfies Omit<Predicate, "uuid">;

export const sigleMinterFixedPricePredicate = {
  name: "sigle-minter-fixed-price",
  chain: "stacks",
  version: 1,
  networks: {
    testnet: {
      if_this: {
        scope: "print_event",
        contract_identifier: sigleConfig[env.STACKS_ENV].fixedPriceMinter,
        matches_regex: ".*",
      },
      then_that: {
        http_post: {
          url: "{__BASE_URL__}/api/chainhook/webhook",
          authorization_header: "Bearer {__TOKEN__}",
        },
      },
      // TODO start_block depending on env.STACKS_ENV
      start_block: 952455,
      decode_clarity_values: true,
    },
  },
} satisfies Omit<Predicate, "uuid">;

export const siglePostPrintPredicate = {
  name: "sigle-post-v001-print",
  chain: "stacks",
  version: 1,
  networks: {
    testnet: {
      if_this: {
        scope: "print_event",
        contract_identifier: "{__CONTRACT__}",
        matches_regex: ".*",
      },
      then_that: {
        http_post: {
          url: "{__BASE_URL__}/api/chainhook/webhook",
          authorization_header: "Bearer {__TOKEN__}",
        },
      },
      start_block: 235887,
      decode_clarity_values: true,
    },
  },
} satisfies Omit<Predicate, "uuid">;
