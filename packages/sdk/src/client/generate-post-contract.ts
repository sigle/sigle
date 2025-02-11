import type { StacksNetworkName, StacksNetwork } from "@stacks/network";
import { contracts } from "@sigle/contracts-source";
import { MAX_UINT } from "../lib/clarity.js";
import { config } from "./config.js";

export type GeneratePostParams = {
  /**
   * The metadata string for the publication
   */
  metadata: string;
  collectInfo: {
    /**
     * The price of the publication in micro-STX
     */
    amount: number | bigint;
    /**
     * Maximum number of editions that can be minted
     * Set undefined to create an open edition
     */
    maxSupply?: number;
  };
};

export type GeneratePostReturn = {
  /**
   * The contract code to be deployed
   */
  contract: string;
};

export const generatePostContract = ({
  params,
  networkName,
}: {
  params: GeneratePostParams;
  network: StacksNetwork;
  networkName: StacksNetworkName;
}): GeneratePostReturn => {
  const nftTrait = config[networkName].nftTrait;
  const commissionTrait = config[networkName].commissionTrait;
  const fixedPriceMinter = config[networkName].fixedPriceMinter;
  const publicationTrait = config[networkName].publicationTrait;

  let contract = contracts.siglePublicationV0.replace(
    "{__BASE_TOKEN_URI__}",
    params.metadata,
  );

  if (params.collectInfo.amount < 0) {
    throw new Error("collectInfo.amount must be > 0");
  }
  if (params.collectInfo.amount > MAX_UINT) {
    throw new Error("collectInfo.amount must be < MAX_UINT");
  }
  const maxSupply = params.collectInfo.maxSupply
    ? `u${params.collectInfo.maxSupply}`
    : `u${MAX_UINT}`;
  contract = contract.replace(
    "(define-data-var max-supply uint u0)",
    `(define-data-var max-supply uint ${maxSupply})`,
  );

  // Replace the init function params
  contract = contract.replace(
    "(contract-call? .sigle-minter-fixed-price-v001 set-mint-details u0 u0 u0)",
    `(contract-call? '${fixedPriceMinter} set-mint-details u${params.collectInfo.amount} u0 u${MAX_UINT})`,
  );

  // Replace the nft trait with the correct one
  contract = contract.replace(
    "(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)",
    `(impl-trait '${nftTrait}.nft-trait)`,
  );

  // Replace the commission trait with the correct one
  contract = contract.replace(
    "(use-trait commission-trait 'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335.commission-trait.commission)",
    `(use-trait commission-trait '${commissionTrait}.commission)`,
  );

  // Replace the publication trait with the correct protocol address
  contract = contract.replace(
    "(impl-trait .sigle-publication-trait-v001.sigle-publication-trait)",
    `(impl-trait '${publicationTrait}.sigle-publication-trait)`,
  );

  // Replace the minter with the correct protocol address
  contract = contract.replace(
    "(define-constant authorized-minter 'ST1AA50K85H2FACBSD3RDQ510Z1YFAFAB66WY4STH.sigle-minter-fixed-price-v001)",
    `(define-constant authorized-minter '${fixedPriceMinter})`,
  );

  return { contract };
};
