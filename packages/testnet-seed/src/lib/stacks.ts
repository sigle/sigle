import { readFileSync } from "node:fs";
import { STACKS_TESTNET } from "@stacks/network";
import { broadcastTransaction, makeContractDeploy } from "@stacks/transactions";
import { generateNewAccount, generateWallet } from "@stacks/wallet-sdk";
import { parse } from "smol-toml";

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

export { network };
