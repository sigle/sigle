import { describe, expect, it } from "vite-plus/test";
import { publishPost } from "./publish-post.js";

describe("publish-post", () => {
  it("should return correct contract call parameters", () => {
    const result = publishPost({
      params: {
        metadataUri: "ipfs://QmTest123",
      },
      networkName: "mocknet",
    });

    expect(result.parameters).toMatchSnapshot();
  });
});
