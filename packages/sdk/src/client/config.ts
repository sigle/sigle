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
    protocolAddress: "STXNKH7PH0JNV55J08BC3C9586PVJ46XG0K69DT5",
    sBTCAsset:
      "ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token::sbtc-token",
    nftTrait: "STXNKH7PH0JNV55J08BC3C9586PVJ46XG0K69DT5.nft-trait",
    commissionTrait:
      "STXNKH7PH0JNV55J08BC3C9586PVJ46XG0K69DT5.commission-trait",
    postTrait: "STXNKH7PH0JNV55J08BC3C9586PVJ46XG0K69DT5.sigle-post-trait-v001",
    fixedPriceMinter:
      "STXNKH7PH0JNV55J08BC3C9586PVJ46XG0K69DT5.sigle-minter-fixed-price-v001",
  },
  devnet: {
    protocolAddress: "STXNKH7PH0JNV55J08BC3C9586PVJ46XG0K69DT5",
    sBTCAsset:
      "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token",
    nftTrait: "STXNKH7PH0JNV55J08BC3C9586PVJ46XG0K69DT5.nft-trait",
    commissionTrait:
      "STXNKH7PH0JNV55J08BC3C9586PVJ46XG0K69DT5.commission-trait",
    postTrait: "STXNKH7PH0JNV55J08BC3C9586PVJ46XG0K69DT5.sigle-post-trait-v001",
    fixedPriceMinter:
      "STXNKH7PH0JNV55J08BC3C9586PVJ46XG0K69DT5.sigle-minter-fixed-price-v001",
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
  protocol: 600n, // 20% of 3000
  creator: 1500n, // 50% of 3000
  createReferrer: 450n, // 15% of 3000
  mintReferrer: 450n, // 15% of 3000
  total: 3000n, // Total in sats
};
