import { describe, expect, it } from "vitest";
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
