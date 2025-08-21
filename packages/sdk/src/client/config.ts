import type { StacksNetworkName } from "@stacks/network";
import type { AssetString } from "@stacks/transactions";

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
    protocolAddress: "ST21VRKNB56B9AJ1CH3SQ7WC581QXFVJP406SBVJA",
    sBTCAsset:
      "ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token::sbtc-token",
    nftTrait: "ST21VRKNB56B9AJ1CH3SQ7WC581QXFVJP406SBVJA.nft-trait",
    commissionTrait:
      "ST21VRKNB56B9AJ1CH3SQ7WC581QXFVJP406SBVJA.commission-trait",
    postTrait:
      "ST21VRKNB56B9AJ1CH3SQ7WC581QXFVJP406SBVJA.sigle-post-trait-v001",
    fixedPriceMinter:
      "ST21VRKNB56B9AJ1CH3SQ7WC581QXFVJP406SBVJA.sigle-minter-fixed-price-v001",
  },
  devnet: {
    protocolAddress: "ST21VRKNB56B9AJ1CH3SQ7WC581QXFVJP406SBVJA",
    sBTCAsset:
      "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token",
    nftTrait: "ST21VRKNB56B9AJ1CH3SQ7WC581QXFVJP406SBVJA.nft-trait",
    commissionTrait:
      "ST21VRKNB56B9AJ1CH3SQ7WC581QXFVJP406SBVJA.commission-trait",
    postTrait:
      "ST21VRKNB56B9AJ1CH3SQ7WC581QXFVJP406SBVJA.sigle-post-trait-v001",
    fixedPriceMinter:
      "ST21VRKNB56B9AJ1CH3SQ7WC581QXFVJP406SBVJA.sigle-minter-fixed-price-v001",
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
