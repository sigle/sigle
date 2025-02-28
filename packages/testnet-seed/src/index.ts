import { sigleClient } from "./lib/sigle.js";

const main = async () => {
  const { contract } = sigleClient.generatePostContract({
    collectInfo: {
      amount: 0,
      maxSupply: 100,
    },
    metadata: "ar://DN1CihyNqyCqUCtwjyoCHQfcLtNwwLB8Jsw2AvYp3kp2",
  });
};

main();
