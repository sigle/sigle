import type { StacksNetworkName } from "@stacks/network";
import { AssetString } from "@stacks/transactions";

export const config: {
  [key in StacksNetworkName]: {
    protocolAddress: string;
    sBTCAsset: AssetString;
    nftTrait: string;
    commissionTrait: string;
    postTrait: string;
    fixedPriceMinter: string;
  };
} = {
  mainnet: {
    protocolAddress: "TODO",
    sBTCAsset:
      "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token",
    nftTrait: "TODO",
    commissionTrait: "TODO",
    postTrait: "TODO",
    fixedPriceMinter: "TODO",
  },
  testnet: {
    protocolAddress: "ST1JRRZ45G7E528BV1M3PR08093JFZGP1C4EZE4MC",
    sBTCAsset:
      "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token",
    nftTrait: "ST1JRRZ45G7E528BV1M3PR08093JFZGP1C4EZE4MC.nft-trait",
    commissionTrait:
      "ST1JRRZ45G7E528BV1M3PR08093JFZGP1C4EZE4MC.commission-trait",
    postTrait:
      "ST1JRRZ45G7E528BV1M3PR08093JFZGP1C4EZE4MC.sigle-post-trait-v001",
    fixedPriceMinter:
      "ST1JRRZ45G7E528BV1M3PR08093JFZGP1C4EZE4MC.sigle-minter-fixed-price-v001",
  },
  devnet: {
    protocolAddress: "ST1JRRZ45G7E528BV1M3PR08093JFZGP1C4EZE4MC",
    sBTCAsset:
      "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token",
    nftTrait: "ST1JRRZ45G7E528BV1M3PR08093JFZGP1C4EZE4MC.nft-trait",
    commissionTrait:
      "ST1JRRZ45G7E528BV1M3PR08093JFZGP1C4EZE4MC.commission-trait",
    postTrait:
      "ST1JRRZ45G7E528BV1M3PR08093JFZGP1C4EZE4MC.sigle-post-trait-v001",
    fixedPriceMinter:
      "ST1JRRZ45G7E528BV1M3PR08093JFZGP1C4EZE4MC.sigle-minter-fixed-price-v001",
  },
  mocknet: {
    protocolAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    sBTCAsset:
      "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token",
    nftTrait: "SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait",
    commissionTrait:
      "SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.commission-trait",
    postTrait:
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sigle-post-trait-v001",
    fixedPriceMinter:
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sigle-minter-fixed-price-v001",
  },
};

export const fixedMintFee = {
  protocol: 2450n,
  creator: 3500n,
  mintReferrer: 1050n,
  total: 7000n,
};
