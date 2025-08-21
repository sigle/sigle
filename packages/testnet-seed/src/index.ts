import { createId } from "@paralleldrive/cuid2";
import { parseBTC } from "@sigle/sdk";
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
      metadata: "ar://M5FWeRhC84c4RjX0EwsgijX7j0Jj0kftM3c33qbaHOg",
    }).contract,
    accountIndex: 1,
  });

  await deployContract({
    contractName: createId(),
    codeBody: sigleClient.generatePostContract({
      collectInfo: {
        amount: parseBTC("0.00042"),
      },
      metadata: "ar://VrLnBatCVd46e5Iy4ksspzmFUnqnFergrNGB8yx7bsU",
    }).contract,
    accountIndex: 2,
  });
};

main();
