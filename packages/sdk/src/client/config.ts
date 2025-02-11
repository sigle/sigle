import type { StacksNetworkName } from "@stacks/network";
import { parseSTX } from "../lib/unit.js";

export const config: {
  [key in StacksNetworkName]: {
    protocolAddress: string;
    nftTrait: string;
    commissionTrait: string;
    publicationTrait: string;
    fixedPriceMinter: string;
  };
} = {
  mainnet: {
    protocolAddress: "TODO",
    nftTrait: "TODO",
    commissionTrait: "TODO",
    publicationTrait: "TODO",
    fixedPriceMinter: "TODO",
  },
  testnet: {
    protocolAddress: "ST1AA50K85H2FACBSD3RDQ510Z1YFAFAB66WY4STH",
    nftTrait: "ST1AA50K85H2FACBSD3RDQ510Z1YFAFAB66WY4STH.nft-trait",
    commissionTrait:
      "ST1AA50K85H2FACBSD3RDQ510Z1YFAFAB66WY4STH.commission-trait",
    publicationTrait:
      "ST1AA50K85H2FACBSD3RDQ510Z1YFAFAB66WY4STH.sigle-publication-trait-v001",
    fixedPriceMinter:
      "ST1AA50K85H2FACBSD3RDQ510Z1YFAFAB66WY4STH.sigle-minter-fixed-price-v001",
  },
  devnet: {
    protocolAddress: "ST1AA50K85H2FACBSD3RDQ510Z1YFAFAB66WY4STH",
    nftTrait: "ST1AA50K85H2FACBSD3RDQ510Z1YFAFAB66WY4STH.nft-trait",
    commissionTrait:
      "ST1AA50K85H2FACBSD3RDQ510Z1YFAFAB66WY4STH.commission-trait",
    publicationTrait:
      "ST1AA50K85H2FACBSD3RDQ510Z1YFAFAB66WY4STH.sigle-publication-trait-v001",
    fixedPriceMinter:
      "ST1AA50K85H2FACBSD3RDQ510Z1YFAFAB66WY4STH.sigle-minter-fixed-price-v001",
  },
  mocknet: {
    protocolAddress: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    nftTrait: "SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait",
    commissionTrait:
      "SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.commission-trait",
    publicationTrait:
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sigle-publication-trait-v001",
    fixedPriceMinter:
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.sigle-minter-fixed-price-v001",
  },
};

export const fixedMintFee = {
  protocol: parseSTX("0.35"),
  creator: parseSTX("0.5"),
  mintReferrer: parseSTX("0.15"),
  total: parseSTX("1"),
};
