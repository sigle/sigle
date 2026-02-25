import { STACKS_MOCKNET } from "@stacks/network";
import { PostConditionMode } from "@stacks/transactions";
import { describe, expect, it } from "vitest";
import { publishPost } from "./publish-post.js";

describe("publish-post", () => {
  it("should return correct contract call parameters", () => {
    const result = publishPost({
      params: {
        url: "ipfs://QmTest123",
      },
      network: STACKS_MOCKNET,
      networkName: "mocknet",
    });

    expect(result.parameters.contractAddress).toBe(
      "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    );
    expect(result.parameters.contractName).toBe("sigle-registry-v001");
    expect(result.parameters.functionName).toBe("publish-post");
    expect(result.parameters.postConditionMode).toBe(PostConditionMode.Deny);
    expect(result.parameters.network).toBe(STACKS_MOCKNET);
  });
});
