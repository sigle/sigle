import { STACKS_MOCKNET } from "@stacks/network";
import { describe, expect, test } from "vitest";
import { generatePostContract } from "./generate-post-contract.js";

describe("generate-post-contract", () => {
  test("should generate open edition contract", () => {
    const data = generatePostContract({
      network: STACKS_MOCKNET,
      networkName: "mocknet",
      params: {
        collectInfo: {
          amount: 0,
        },
        metadata: "ipfs://whatever",
      },
    });
    expect(data.contract).toMatchSnapshot();
  });

  test("should generate fixed edition contract", () => {
    const data = generatePostContract({
      network: STACKS_MOCKNET,
      networkName: "mocknet",
      params: {
        collectInfo: {
          amount: 0,
          maxSupply: 100,
        },
        metadata: "ipfs://whatever",
      },
    });
    expect(data.contract).toMatchSnapshot();
  });

  test("should generate paid edition contract", () => {
    const data = generatePostContract({
      network: STACKS_MOCKNET,
      networkName: "mocknet",
      params: {
        collectInfo: {
          amount: 10,
          maxSupply: 100,
        },
        metadata: "ipfs://whatever",
      },
    });
    expect(data.contract).toMatchSnapshot();
  });

  test("should generate fixed edition with create referrer", () => {
    const data = generatePostContract({
      network: STACKS_MOCKNET,
      networkName: "mocknet",
      params: {
        collectInfo: {
          amount: 0,
          maxSupply: 100,
          createReferrer: "SP2X0TZ59D5SZ8ACQ6YMCHHNR2ZN51Z32E2CJ173",
        },
        metadata: "ipfs://whatever",
      },
    });
    expect(data.contract).toMatchSnapshot();
  });
});
