import { describe, expect, it } from "vite-plus/test";
import { fixedMintFee } from "./config.js";

describe("config", () => {
  it("should have fixed mint fee", () => {
    expect(fixedMintFee.total).toBe(
      fixedMintFee.protocol +
        fixedMintFee.creator +
        fixedMintFee.createReferrer +
        fixedMintFee.mintReferrer,
    );
  });
});
