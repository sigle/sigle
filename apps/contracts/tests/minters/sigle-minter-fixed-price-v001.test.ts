import { createClient, fixedMintFee, parseSTX } from "@sigle/sdk";
import { STACKS_MOCKNET } from "@stacks/network";
import { Cl } from "@stacks/transactions";
import { beforeEach, describe, expect, it } from "vitest";

const contract = "sigle-minter-fixed-price-v001";
const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;

const sigleClient = createClient({
  network: STACKS_MOCKNET,
  networkName: "mocknet",
});

describe(contract, () => {
  const { contract: defaultContract } = sigleClient.generatePostContract({
    collectInfo: {
      amount: 0,
      maxSupply: 100,
    },
    metadata: "ipfs://anything",
  });
  const defaultContractName = `${wallet1}.default-contract`;

  describe("update-fees", () => {
    describe("update-fees", () => {
      it("allows protocol owner to update fees", () => {
        const { result } = simnet.callPublicFn(
          contract,
          "update-fees",
          [
            Cl.uint(100000), // Protocol fee
            Cl.uint(200000), // Creator fee
            Cl.uint(50000), // Referrer fee
          ],
          deployer,
        );

        expect(result).toBeOk(Cl.bool(true));
      });

      it("prevents non-owner from updating fees", () => {
        const { result } = simnet.callPublicFn(
          contract,
          "update-fees",
          [Cl.uint(100000), Cl.uint(200000), Cl.uint(50000)],
          wallet1,
        );

        expect(result).toBeErr(Cl.uint(403)); // ERR-NOT-AUTHORIZED
      });
    });
  });

  describe("mint", () => {
    beforeEach(() => {
      simnet.deployContract(
        defaultContractName.split(".")[1],
        defaultContract,
        { clarityVersion: 3 },
        wallet1,
      );
    });

    it("allows minting within valid parameters", () => {
      const quantity = 1;

      const { result } = simnet.callPublicFn(
        contract,
        "mint",
        [
          Cl.contractPrincipal(
            defaultContractName.split(".")[0],
            defaultContractName.split(".")[1],
          ), // token contract
          Cl.uint(quantity),
          Cl.none(), // no referrer
          Cl.none(), // no specific recipient
        ],
        wallet2,
      );

      expect(result).toBeOk(Cl.bool(true));
    });

    it("fails when trying to mint more than max quantity", () => {
      const { result } = simnet.callPublicFn(
        contract,
        "mint",
        [
          Cl.contractPrincipal(
            defaultContractName.split(".")[0],
            defaultContractName.split(".")[1],
          ),
          Cl.uint(11), // More than max 10
          Cl.none(),
          Cl.none(),
        ],
        wallet2,
      );

      expect(result).toBeErr(Cl.uint(1001)); // ERR-INVALID-QUANTITY
    });
  });

  describe("fees", () => {
    it("fees should match the SDK values for free mints", () => {
      simnet.deployContract(
        defaultContractName.split(".")[1],
        defaultContract,
        { clarityVersion: 3 },
        wallet1,
      );

      const { events } = simnet.callPublicFn(
        contract,
        "mint",
        [
          Cl.contractPrincipal(
            defaultContractName.split(".")[0],
            defaultContractName.split(".")[1],
          ),
          Cl.uint(1),
          Cl.some(Cl.principal(wallet3)),
          Cl.none(), // no specific recipient
        ],
        wallet2,
      );

      expect(events[0]).toEqual({
        event: "ft_transfer_event",
        data: {
          amount: fixedMintFee.protocol.toString(),
          asset_identifier:
            "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token",
          recipient: deployer,
          sender: wallet2,
        },
      });
      expect(events[1]).toEqual({
        event: "ft_transfer_event",
        data: {
          amount: fixedMintFee.creator.toString(),
          asset_identifier:
            "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token",
          recipient: wallet1,
          sender: wallet2,
        },
      });
      expect(events[2]).toEqual({
        event: "ft_transfer_event",
        data: {
          amount: fixedMintFee.mintReferrer.toString(),
          asset_identifier:
            "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token",
          recipient: wallet3,
          sender: wallet2,
        },
      });
    });

    it("fees should match the SDK values for paid mints", () => {
      const { contract: defaultContract } = sigleClient.generatePostContract({
        collectInfo: {
          amount: parseSTX("4.2"),
          maxSupply: 100,
        },
        metadata: "ipfs://anything",
      });
      const defaultContractName = `${wallet1}.default-contract`;

      simnet.deployContract(
        defaultContractName.split(".")[1],
        defaultContract,
        { clarityVersion: 3 },
        wallet1,
      );

      const { events } = simnet.callPublicFn(
        contract,
        "mint",
        [
          Cl.contractPrincipal(
            defaultContractName.split(".")[0],
            defaultContractName.split(".")[1],
          ),
          Cl.uint(1),
          Cl.some(Cl.principal(wallet3)),
          Cl.none(), // no specific recipient
        ],
        wallet2,
      );

      expect(events[0]).toEqual({
        event: "ft_transfer_event",
        data: {
          amount: fixedMintFee.protocol.toString(),
          asset_identifier:
            "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token",
          recipient: deployer,
          sender: wallet2,
        },
      });
      expect(events[1]).toEqual({
        event: "ft_transfer_event",
        data: {
          amount: (parseSTX("4.2") + fixedMintFee.creator).toString(),
          asset_identifier:
            "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token",
          recipient: wallet1,
          sender: wallet2,
        },
      });
      expect(events[2]).toEqual({
        event: "ft_transfer_event",
        data: {
          amount: fixedMintFee.mintReferrer.toString(),
          asset_identifier:
            "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token",
          recipient: wallet3,
          sender: wallet2,
        },
      });
    });
  });
});
