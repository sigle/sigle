import { createClient, fixedMintFee } from "@sigle/sdk";
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

  describe("owner-mint", () => {
    beforeEach(() => {
      simnet.deployContract(
        defaultContractName.split(".")[1],
        defaultContract,
        { clarityVersion: 3 },
        wallet1,
      );
    });

    it("allows contract owner to mint tokens for free", () => {
      const quantity = 3;

      const { result, events } = simnet.callPublicFn(
        contract,
        "owner-mint",
        [
          Cl.contractPrincipal(
            defaultContractName.split(".")[0],
            defaultContractName.split(".")[1],
          ), // token contract
          Cl.uint(quantity),
          Cl.none(), // no specific recipient
        ],
        wallet1, // wallet1 is the contract owner
      );

      expect(result).toBeOk(Cl.bool(true));

      // Check NFT minting events - should be 3 nft_mint_events
      const mintEvents = events.filter((e) => e.event === "nft_mint_event");
      expect(mintEvents.length).toBe(quantity);

      // Important: Verify that NO sBTC transfer events occurred (free mint)
      const transferEvents = events.filter(
        (e) => e.event === "ft_transfer_event",
      );
      expect(transferEvents.length).toBe(0);

      // Check token ownership after minting
      for (let i = 1; i <= quantity; i++) {
        const { result: tokenOwner } = simnet.callReadOnlyFn(
          defaultContractName,
          "get-owner",
          [Cl.uint(i)],
          wallet1,
        );
        expect(tokenOwner).toBeOk(Cl.some(Cl.principal(wallet1)));
      }
    });

    it("allows contract owner to mint tokens for a specific recipient", () => {
      const quantity = 2;

      const { result, events } = simnet.callPublicFn(
        contract,
        "owner-mint",
        [
          Cl.contractPrincipal(
            defaultContractName.split(".")[0],
            defaultContractName.split(".")[1],
          ),
          Cl.uint(quantity),
          Cl.some(Cl.principal(wallet3)), // mint to wallet3
        ],
        wallet1, // wallet1 is the contract owner
      );

      expect(result).toBeOk(Cl.bool(true));

      // Check NFT minting events
      const mintEvents = events.filter((e) => e.event === "nft_mint_event");
      expect(mintEvents.length).toBe(quantity);

      // Check that tokens were minted to wallet3
      for (let i = 1; i <= quantity; i++) {
        const { result: tokenOwner } = simnet.callReadOnlyFn(
          defaultContractName,
          "get-owner",
          [Cl.uint(i)],
          wallet1,
        );
        expect(tokenOwner).toBeOk(Cl.some(Cl.principal(wallet3)));
      }
    });

    it("prevents non-owner from using owner-mint", () => {
      const { result } = simnet.callPublicFn(
        contract,
        "owner-mint",
        [
          Cl.contractPrincipal(
            defaultContractName.split(".")[0],
            defaultContractName.split(".")[1],
          ),
          Cl.uint(1),
          Cl.none(),
        ],
        wallet2, // wallet2 is not the contract owner
      );

      expect(result).toBeErr(Cl.uint(403)); // ERR-NOT-AUTHORIZED
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
          amount: 42000,
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
          amount: (42000n + fixedMintFee.creator).toString(),
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

  describe("set-mint-details", () => {
    beforeEach(() => {
      simnet.deployContract(
        defaultContractName.split(".")[1],
        defaultContract,
        { clarityVersion: 3 },
        wallet1,
      );
    });

    it("allows contract owner to update mint details", () => {
      const { result } = simnet.callPublicFn(
        contract,
        "set-mint-details",
        [
          Cl.contractPrincipal(
            defaultContractName.split(".")[0],
            defaultContractName.split(".")[1],
          ),
          Cl.uint(2000000), // new price
          Cl.uint(20), // new start-block
          Cl.uint(200), // new end-block
        ],
        wallet1, // wallet1 is the contract owner
      );

      expect(result).toBeOk(Cl.bool(true));

      // Verify the updated config
      const { result: config } = simnet.callReadOnlyFn(
        contract,
        "get-contract-config",
        [Cl.principal(defaultContractName)],
        wallet1,
      );

      expect(config).toBeSome(
        Cl.tuple({
          price: Cl.uint(2000000),
          "start-block": Cl.uint(20),
          "end-block": Cl.uint(200),
        }),
      );
    });

    it("prevents non-owner from updating mint details", () => {
      const { result } = simnet.callPublicFn(
        contract,
        "set-mint-details",
        [
          Cl.contractPrincipal(
            defaultContractName.split(".")[0],
            defaultContractName.split(".")[1],
          ),
          Cl.uint(2000000),
          Cl.uint(20),
          Cl.uint(200),
        ],
        wallet2, // wallet2 is not the contract owner
      );

      expect(result).toBeErr(Cl.uint(403)); // ERR-NOT-AUTHORIZED
    });

    it("fails when end block is before start block", () => {
      const { result } = simnet.callPublicFn(
        contract,
        "set-mint-details",
        [
          Cl.contractPrincipal(
            defaultContractName.split(".")[0],
            defaultContractName.split(".")[1],
          ),
          Cl.uint(2000000),
          Cl.uint(100), // start-block after end-block
          Cl.uint(50), // end-block before start-block
        ],
        wallet1,
      );

      expect(result).toBeErr(Cl.uint(1002)); // ERR-INVALID-END-BLOCK
    });

    it("fails when sale has already ended", () => {
      // First set a sale that ends at block 100
      simnet.callPublicFn(
        contract,
        "set-mint-details",
        [
          Cl.contractPrincipal(
            defaultContractName.split(".")[0],
            defaultContractName.split(".")[1],
          ),
          Cl.uint(1000000),
          Cl.uint(10),
          Cl.uint(100),
        ],
        wallet1,
      );

      // Advance block height beyond end block
      simnet.mineEmptyBlocks(101);

      // Try to update the sale details
      const { result } = simnet.callPublicFn(
        contract,
        "set-mint-details",
        [
          Cl.contractPrincipal(
            defaultContractName.split(".")[0],
            defaultContractName.split(".")[1],
          ),
          Cl.uint(2000000),
          Cl.uint(120),
          Cl.uint(200),
        ],
        wallet1,
      );

      expect(result).toBeErr(Cl.uint(1004)); // ERR-SALE-ENDED
    });
  });
});
