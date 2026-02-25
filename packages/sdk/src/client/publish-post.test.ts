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

    expect(result.parameters).toMatchSnapshot();
  });
});
