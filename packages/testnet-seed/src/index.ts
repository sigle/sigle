import { publishPost } from "./lib/stacks.js";

const main = async () => {
  await publishPost({
    metadataUri: "ar://M5FWeRhC84c4RjX0EwsgijX7j0Jj0kftM3c33qbaHOg",
    accountIndex: 1,
  });

  // TODO await that the block is mined before publishing the next one

  await publishPost({
    metadataUri: "ar://VrLnBatCVd46e5Iy4ksspzmFUnqnFergrNGB8yx7bsU",
    accountIndex: 2,
  });
};

main();
