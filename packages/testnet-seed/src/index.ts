import { publishPost } from "./lib/stacks.js";

const main = async () => {
  await publishPost({
    metadataUri: "ar://CG9fv1vW2PJU6dP1xKBDV4v2H1FCnMi7CTRAMw4t1Ig",
    accountIndex: 1,
  });

  await publishPost({
    metadataUri: "ar://WT2CvxF7LimtAkzQR-6gCiBZ6RQ_DgATizxu2HePcZc",
    accountIndex: 2,
  });
};

main();
