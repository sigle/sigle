import { expect, test } from "vitest";
import { fixedMintFeeFree, fixedMintFeePaid } from "./config.js";

test("should have free fixed mint fee", () => {
  expect(fixedMintFeeFree.total).toBe(
    fixedMintFeeFree.protocol +
      fixedMintFeeFree.creator +
      fixedMintFeeFree.mintReferrer
  );
});

test("should have paid fixed mint fee", () => {
  expect(fixedMintFeePaid.total).toBe(
    fixedMintFeePaid.protocol +
      fixedMintFeePaid.creator +
      fixedMintFeePaid.mintReferrer
  );
});
