import { STACKS_TESTNET } from "@stacks/network";
import {
  broadcastTransaction,
  makeContractCall,
  makeContractDeploy,
} from "@stacks/transactions";
import { generateNewAccount, generateWallet } from "@stacks/wallet-sdk";
import { readFileSync } from "node:fs";
import { parse } from "smol-toml";
import { sigleClient } from "./sigle.js";

const network = STACKS_TESTNET;

const configFile = readFileSync(
  "../../apps/contracts/settings/Testnet.toml",
  "utf-8",
);
const config = parse(configFile);
// @ts-expect-error Not typed properly
const mnemonic = config.accounts.deployer.mnemonic;

let wallet = await generateWallet({
  secretKey: mnemonic,
  password: "",
});

while (wallet.accounts.length < 5) {
  wallet = generateNewAccount(wallet);
}

export const deployContract = async ({
  contractName,
  codeBody,
  accountIndex,
}: {
  contractName: string;
  codeBody: string;
  accountIndex: number;
}) => {
  const privateKey = wallet.accounts[accountIndex].stxPrivateKey;

  const transaction = await makeContractDeploy({
    contractName,
    codeBody,
    senderKey: privateKey,
    network,
  });
  const broadcastResponse = await broadcastTransaction({ transaction });
  console.log("submitted tx", broadcastResponse);
};

export const publishPost = async ({
  metadataUri,
  accountIndex,
}: {
  metadataUri: string;
  accountIndex: number;
}) => {
  const privateKey = wallet.accounts[accountIndex].stxPrivateKey;

  const { parameters } = sigleClient.publishPost({
    metadataUri,
  });

  const transaction = await makeContractCall({
    // oxlint-disable-next-line no-explicit-any
    ...(parameters as any),
    senderKey: privateKey,
  });
  const broadcastResponse = await broadcastTransaction({ transaction });
  console.log("submitted tx", broadcastResponse);
  return broadcastResponse.txid;
};

export { network };
