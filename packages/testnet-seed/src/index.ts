import { createId } from "@paralleldrive/cuid2";
import { parseSTX } from "@sigle/sdk";
import { sigleClient } from "./lib/sigle.js";
import { deployContract } from "./lib/stacks.js";

const main = async () => {
  await deployContract({
    contractName: createId(),
    codeBody: sigleClient.generatePostContract({
      collectInfo: {
        amount: 0,
        maxSupply: 100,
      },
      metadata: "ar://b9a84dVnyZxvumWdLejghGYgmt7XoVoJZZoJIKWoraA",
    }).contract,
    accountIndex: 1,
  });

  await deployContract({
    contractName: createId(),
    codeBody: sigleClient.generatePostContract({
      collectInfo: {
        amount: parseSTX("1.42"),
      },
      metadata: "ar://D3H6nGzSwgqdFa6FMtFh9qcN2Y42S9rmWAvYPtt3TBvS",
    }).contract,
    accountIndex: 2,
  });
};

main();
