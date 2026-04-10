// oxlint-disable no-non-null-assertion
import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const contract = "sigle-registry-v001";
const accounts = simnet.getAccounts();
const wallet1 = accounts.get("wallet_1")!;

describe(contract, () => {
  describe("publish-post", () => {
    it("allows publishing a post with valid URL", () => {
      const url = "ipfs://QmTest123";
      const { result } = simnet.callPublicFn(
        contract,
        "publish-post",
        [Cl.stringAscii(url)],
        wallet1,
      );
      expect(result).toBeOk(Cl.bool(true));
    });
  });
});
