import { Cl } from '@stacks/transactions';
import { describe, expect, it } from 'vitest';
import { createClient } from '@sigle/sdk';
import { STACKS_MOCKNET } from '@stacks/network';
import { beforeEach } from 'vitest';

const contract = 'sigle-publication-v001';
const minterContract = 'sigle-minter-fixed-price-v001';
const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const wallet1 = accounts.get('wallet_1')!;
const wallet2 = accounts.get('wallet_2')!;
const wallet3 = accounts.get('wallet_3')!;

const sigleClient = createClient({
  network: STACKS_MOCKNET,
  networkName: 'mocknet',
});

describe('sigle-publication-v001', () => {
  const { contract: defaultContract } = sigleClient.generatePostContract({
    collectInfo: {
      amount: 0,
      maxSupply: 100,
    },
    metadata: 'ipfs://anything',
  });
  const defaultContractName = `${wallet1}.default-contract`;

  describe('initialization', () => {
    beforeEach(() => {
      simnet.deployContract(
        defaultContractName.split('.')[1],
        defaultContract,
        { clarityVersion: 3 },
        wallet1,
      );
    });

    it('should initialize with correct owner', () => {
      const { result } = simnet.callReadOnlyFn(
        defaultContractName,
        'get-contract-owner',
        [],
        wallet1,
      );
      expect(result).toBeOk(Cl.principal(wallet1));
    });

    it('should initialize with correct version', () => {
      const { result } = simnet.callReadOnlyFn(
        defaultContractName,
        'get-version',
        [],
        deployer,
      );
      expect(result).toBeOk(Cl.uint(1));
    });

    it('should initialize with correct minter', () => {
      const { result } = simnet.callReadOnlyFn(
        contract,
        'get-minter',
        [],
        deployer,
      );
      expect(result).toBeOk(
        Cl.principal(
          `ST1AA50K85H2FACBSD3RDQ510Z1YFAFAB66WY4STH.${minterContract}`,
        ),
      );
    });
  });

  describe('ownership', () => {
    it('should allow ownership transfer', () => {
      // Start transfer
      const { result: transferResult } = simnet.callPublicFn(
        contract,
        'transfer-ownership',
        [Cl.some(Cl.principal(wallet1))],
        deployer,
      );
      expect(transferResult).toBeOk(Cl.bool(true));

      // Accept transfer
      const { result: acceptResult } = simnet.callPublicFn(
        contract,
        'accept-ownership',
        [],
        wallet1,
      );
      expect(acceptResult).toBeOk(Cl.bool(true));

      // Verify new owner
      const { result: ownerResult } = simnet.callReadOnlyFn(
        contract,
        'get-contract-owner',
        [],
        deployer,
      );
      expect(ownerResult).toBeOk(Cl.principal(wallet1));
    });

    it('should prevent unauthorized ownership transfer', () => {
      const { result } = simnet.callPublicFn(
        contract,
        'transfer-ownership',
        [Cl.some(Cl.principal(wallet2))],
        wallet2,
      );
      expect(result).toBeErr(Cl.uint(403)); // ERR-NOT-AUTHORIZED
    });
  });

  describe('metadata management', () => {
    it('should allow owner to set base token URI', () => {
      const newUri = 'https://api.example.com/tokens/';
      const { result } = simnet.callPublicFn(
        contract,
        'set-base-token-uri',
        [Cl.stringAscii(newUri)],
        deployer,
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it('should allow owner to freeze metadata', () => {
      const { result } = simnet.callPublicFn(
        contract,
        'freeze-metadata',
        [],
        deployer,
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify metadata is frozen
      const { result: frozenStatus } = simnet.callReadOnlyFn(
        contract,
        'get-metadata-frozen',
        [],
        deployer,
      );
      expect(frozenStatus).toBeOk(Cl.bool(true));
    });

    it('should prevent URI updates when metadata is frozen', () => {
      // First freeze metadata
      simnet.callPublicFn(contract, 'freeze-metadata', [], deployer);

      // Try to update URI
      const { result } = simnet.callPublicFn(
        contract,
        'set-base-token-uri',
        [Cl.stringAscii('new-uri')],
        deployer,
      );
      expect(result).toBeErr(Cl.uint(1009)); // ERR-METADATA-FROZEN
    });
  });

  describe('token management', () => {
    beforeEach(() => {
      simnet.deployContract(
        defaultContractName.split('.')[1],
        defaultContract,
        { clarityVersion: 3 },
        wallet1,
      );

      // Mint a token for testing
      simnet.callPublicFn(
        minterContract,
        'mint',
        [
          Cl.contractPrincipal(
            defaultContractName.split('.')[0],
            defaultContractName.split('.')[1],
          ),
          Cl.uint(1),
          Cl.none(),
          Cl.none(),
        ],
        wallet2,
      );
    });

    it('should allow token transfer by owner', () => {
      const { result } = simnet.callPublicFn(
        defaultContractName,
        'transfer',
        [Cl.uint(1), Cl.principal(wallet2), Cl.principal(wallet3)],
        wallet2,
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it('should allow token burn by owner', () => {
      const { result } = simnet.callPublicFn(
        defaultContractName,
        'burn',
        [Cl.uint(1)],
        wallet2,
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it('should prevent unauthorized transfers', () => {
      const { result } = simnet.callPublicFn(
        contract,
        'transfer',
        [Cl.uint(1), Cl.principal(wallet2), Cl.principal(wallet3)],
        wallet3,
      );
      expect(result).toBeErr(Cl.uint(403)); // ERR-NOT-AUTHORIZED
    });

    it('should prevent burning by non-owner', () => {
      const { result } = simnet.callPublicFn(
        defaultContractName,
        'burn',
        [Cl.uint(1)],
        wallet3,
      );
      expect(result).toBeErr(Cl.uint(403)); // ERR-NOT-AUTHORIZED
    });
  });

  describe('supply management', () => {
    beforeEach(() => {
      simnet.deployContract(
        defaultContractName.split('.')[1],
        defaultContract,
        { clarityVersion: 3 },
        wallet1,
      );
    });

    it('should allow owner to reduce max supply', () => {
      const { result } = simnet.callPublicFn(
        defaultContractName,
        'reduce-supply',
        [Cl.uint(50)], // Reduce to 50 tokens
        wallet1,
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify new max supply
      const { result: maxSupply } = simnet.callReadOnlyFn(
        defaultContractName,
        'get-max-supply',
        [],
        wallet1,
      );
      expect(maxSupply).toBeOk(Cl.uint(50));
    });

    it('should prevent non-owner from reducing supply', () => {
      const { result } = simnet.callPublicFn(
        defaultContractName,
        'reduce-supply',
        [Cl.uint(50)],
        wallet2,
      );
      expect(result).toBeErr(Cl.uint(403)); // ERR-NOT-AUTHORIZED
    });

    it('should prevent increasing max supply', () => {
      // First reduce supply
      simnet.callPublicFn(
        defaultContractName,
        'reduce-supply',
        [Cl.uint(50)],
        wallet1,
      );

      // Try to increase supply
      const { result } = simnet.callPublicFn(
        defaultContractName,
        'reduce-supply',
        [Cl.uint(100)],
        wallet1,
      );
      expect(result).toBeErr(Cl.uint(1008)); // ERR-INVALID-LIMIT
    });

    it('should allow reducing supply to current minted amount', () => {
      // Mint some tokens first
      simnet.callPublicFn(
        minterContract,
        'mint',
        [
          Cl.contractPrincipal(
            defaultContractName.split('.')[0],
            defaultContractName.split('.')[1],
          ),
          Cl.uint(1),
          Cl.none(),
          Cl.none(),
        ],
        wallet2,
      );
      simnet.callPublicFn(
        minterContract,
        'mint',
        [
          Cl.contractPrincipal(
            defaultContractName.split('.')[0],
            defaultContractName.split('.')[1],
          ),
          Cl.uint(1),
          Cl.none(),
          Cl.none(),
        ],
        wallet2,
      );

      // Reduce supply to current minted amount
      const { result } = simnet.callPublicFn(
        defaultContractName,
        'reduce-supply',
        [Cl.uint(2)],
        wallet1,
      );
      expect(result).toBeOk(Cl.bool(true));
    });

    it('should prevent reducing supply below current minted amount', () => {
      // Mint some tokens first
      simnet.callPublicFn(
        minterContract,
        'mint',
        [
          Cl.contractPrincipal(
            defaultContractName.split('.')[0],
            defaultContractName.split('.')[1],
          ),
          Cl.uint(1),
          Cl.none(),
          Cl.none(),
        ],
        wallet2,
      );
      simnet.callPublicFn(
        minterContract,
        'mint',
        [
          Cl.contractPrincipal(
            defaultContractName.split('.')[0],
            defaultContractName.split('.')[1],
          ),
          Cl.uint(1),
          Cl.none(),
          Cl.none(),
        ],
        wallet2,
      );

      // Try to reduce supply below minted amount
      const { result } = simnet.callPublicFn(
        defaultContractName,
        'reduce-supply',
        [Cl.uint(1)], // Try to reduce to 1 when 2 are minted
        wallet1,
      );
      expect(result).toBeErr(Cl.uint(1008)); // ERR-INVALID-LIMIT
    });
  });

  describe('marketplace functionality', () => {
    beforeEach(() => {
      simnet.deployContract(
        defaultContractName.split('.')[1],
        defaultContract,
        { clarityVersion: 3 },
        wallet1,
      );

      // Mint a token for testing
      simnet.callPublicFn(
        minterContract,
        'mint',
        [
          Cl.contractPrincipal(
            defaultContractName.split('.')[0],
            defaultContractName.split('.')[1],
          ),
          Cl.uint(1),
          Cl.none(),
          Cl.none(),
        ],
        wallet2,
      );
    });

    describe('listing operations', () => {
      it('should allow listing token for sale', () => {
        const { result } = simnet.callPublicFn(
          defaultContractName,
          'list-in-ustx',
          [
            Cl.uint(1),
            Cl.uint(1000000), // 1 STX
            Cl.contractPrincipal(
              'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335',
              'commission-trait',
            ),
          ],
          wallet2,
        );
        expect(result).toBeOk(Cl.bool(true));
      });

      it('should prevent non-owner from listing token', () => {
        const { result } = simnet.callPublicFn(
          defaultContractName,
          'list-in-ustx',
          [
            Cl.uint(1),
            Cl.uint(1000000),
            Cl.contractPrincipal(
              'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335',
              'commission-trait',
            ),
          ],
          wallet3,
        );
        expect(result).toBeErr(Cl.uint(403)); // ERR-NOT-AUTHORIZED
      });

      it('should allow updating listing price', () => {
        // Initial listing
        simnet.callPublicFn(
          defaultContractName,
          'list-in-ustx',
          [
            Cl.uint(1),
            Cl.uint(1000000), // 1 STX
            Cl.contractPrincipal(
              'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335',
              'commission-trait',
            ),
          ],
          wallet2,
        );

        // Update price
        const { result } = simnet.callPublicFn(
          defaultContractName,
          'list-in-ustx',
          [
            Cl.uint(1),
            Cl.uint(2000000), // 2 STX
            Cl.contractPrincipal(
              'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335',
              'commission-trait',
            ),
          ],
          wallet2,
        );
        expect(result).toBeOk(Cl.bool(true));

        // Verify updated price
        const { result: listing } = simnet.callReadOnlyFn(
          defaultContractName,
          'get-listing-in-ustx',
          [Cl.uint(1)],
          deployer,
        );
        expect(listing).toEqual(
          Cl.some(
            Cl.tuple({
              commission: Cl.contractPrincipal(
                'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335',
                'commission-trait',
              ),
              price: Cl.uint(2000000),
              royalty: Cl.uint(1000),
            }),
          ),
        );
      });
    });

    describe('unlisting operations', () => {
      beforeEach(() => {
        // List token for each test
        simnet.callPublicFn(
          defaultContractName,
          'list-in-ustx',
          [
            Cl.uint(1),
            Cl.uint(1000000), // 1 STX
            Cl.contractPrincipal(
              'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335',
              'commission-trait',
            ),
          ],
          wallet2,
        );
      });

      it('should allow unlisting token', () => {
        const { result } = simnet.callPublicFn(
          defaultContractName,
          'unlist-in-ustx',
          [Cl.uint(1)],
          wallet2,
        );
        expect(result).toBeOk(Cl.bool(true));

        // Verify listing is removed
        const { result: listing } = simnet.callReadOnlyFn(
          contract,
          'get-listing-in-ustx',
          [Cl.uint(1)],
          deployer,
        );
        expect(listing).toBeNone();
      });

      it('should prevent non-owner from unlisting token', () => {
        const { result } = simnet.callPublicFn(
          contract,
          'unlist-in-ustx',
          [Cl.uint(1)],
          wallet3,
        );
        expect(result).toBeErr(Cl.uint(403)); // ERR-NOT-AUTHORIZED
      });
    });
  });

  describe('minting operations', () => {
    beforeEach(() => {
      simnet.deployContract(
        defaultContractName.split('.')[1],
        defaultContract,
        { clarityVersion: 3 },
        wallet1,
      );
    });

    describe('mint function', () => {
      it('should allow authorized minter to mint tokens', () => {
        const { result } = simnet.callPublicFn(
          minterContract,
          'mint',
          [
            Cl.contractPrincipal(
              defaultContractName.split('.')[0],
              defaultContractName.split('.')[1],
            ),
            Cl.uint(1),
            Cl.none(),
            Cl.none(),
          ],
          wallet2,
        );
        expect(result).toBeOk(Cl.bool(true));

        // Verify token ownership
        const { result: ownerResult } = simnet.callReadOnlyFn(
          defaultContractName,
          'get-owner',
          [Cl.uint(1)],
          wallet2,
        );
        expect(ownerResult).toBeOk(Cl.some(Cl.principal(wallet2)));
      });

      it('should prevent unauthorized addresses from minting', () => {
        const { result } = simnet.callPublicFn(
          defaultContractName,
          'mint',
          [Cl.principal(wallet2)],
          wallet2, // Non-minter trying to mint
        );
        expect(result).toBeErr(Cl.uint(403)); // ERR-NOT-AUTHORIZED
      });

      it('should respect max supply limit', () => {
        // First reduce max supply to 2
        simnet.callPublicFn(
          defaultContractName,
          'reduce-supply',
          [Cl.uint(2)],
          wallet1,
        );

        // Mint first token
        simnet.callPublicFn(
          minterContract,
          'mint',
          [
            Cl.contractPrincipal(
              defaultContractName.split('.')[0],
              defaultContractName.split('.')[1],
            ),
            Cl.uint(1),
            Cl.none(),
            Cl.none(),
          ],
          wallet2,
        );

        // Mint second token
        simnet.callPublicFn(
          minterContract,
          'mint',
          [
            Cl.contractPrincipal(
              defaultContractName.split('.')[0],
              defaultContractName.split('.')[1],
            ),
            Cl.uint(1),
            Cl.none(),
            Cl.none(),
          ],
          wallet2,
        );

        // Try to mint third token (should fail)
        const { result } = simnet.callPublicFn(
          minterContract,
          'mint',
          [
            Cl.contractPrincipal(
              defaultContractName.split('.')[0],
              defaultContractName.split('.')[1],
            ),
            Cl.uint(1),
            Cl.none(),
            Cl.none(),
          ],
          wallet2,
        );
        expect(result).toBeErr(Cl.uint(1006)); // ERR-ALL-MINTED
      });

      describe('mint controls', () => {
        it('should respect mint enabled/disabled state', () => {
          // Disable minting
          simnet.callPublicFn(
            defaultContractName,
            'set-mint-enabled',
            [Cl.bool(false)],
            wallet1,
          );

          // Try to mint when disabled
          const { result } = simnet.callPublicFn(
            minterContract,
            'mint',
            [
              Cl.contractPrincipal(
                defaultContractName.split('.')[0],
                defaultContractName.split('.')[1],
              ),
              Cl.uint(1),
              Cl.none(),
              Cl.none(),
            ],
            wallet2,
          );
          expect(result).toBeErr(Cl.uint(1007)); // ERR-MINT-PAUSED
        });

        it('should maintain correct token count after multiple mints', () => {
          // Mint multiple tokens
          simnet.callPublicFn(
            minterContract,
            'mint',
            [
              Cl.contractPrincipal(
                defaultContractName.split('.')[0],
                defaultContractName.split('.')[1],
              ),
              Cl.uint(2),
              Cl.none(),
              Cl.none(),
            ],
            wallet2,
          );

          // Check last token ID
          const { result } = simnet.callReadOnlyFn(
            defaultContractName,
            'get-last-token-id',
            [],
            wallet2,
          );
          expect(result).toBeOk(Cl.uint(2));
        });

        it('should allow minting to a different recipient', () => {
          const { result } = simnet.callPublicFn(
            minterContract,
            'mint',
            [
              Cl.contractPrincipal(
                defaultContractName.split('.')[0],
                defaultContractName.split('.')[1],
              ),
              Cl.uint(1),
              Cl.none(),
              Cl.some(Cl.principal(wallet3)), // Specify different recipient
            ],
            wallet2,
          );
          expect(result).toBeOk(Cl.bool(true));

          // Verify token ownership
          const { result: ownerResult } = simnet.callReadOnlyFn(
            defaultContractName,
            'get-owner',
            [Cl.uint(1)],
            wallet2,
          );
          expect(ownerResult).toBeOk(Cl.some(Cl.principal(wallet3)));
        });
      });
    });
  });
});
