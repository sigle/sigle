import { Cl } from '@stacks/transactions';
import { describe, expect, it } from 'vitest';

const contract = 'sigle-protocol';
const accounts = simnet.getAccounts();
const deployer = accounts.get('deployer')!;
const wallet1 = accounts.get('wallet_1')!;
const wallet2 = accounts.get('wallet_2')!;

describe(contract, () => {
  describe('initialization', () => {
    it('should initialize with deployer as contract owner', () => {
      const { result } = simnet.callReadOnlyFn(
        contract,
        'get-contract-owner',
        [],
        deployer,
      );
      expect(result).toBePrincipal(deployer);
    });

    it('should initialize with deployer as payout address', () => {
      const { result } = simnet.callReadOnlyFn(
        contract,
        'get-payout-address',
        [],
        deployer,
      );
      expect(result).toBePrincipal(deployer);
    });
  });

  describe('set-contract-owner', () => {
    it('allows contract owner to set new owner', () => {
      const { result } = simnet.callPublicFn(
        contract,
        'set-contract-owner',
        [Cl.principal(wallet1)],
        deployer,
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify the new owner
      const { result: newOwner } = simnet.callReadOnlyFn(
        contract,
        'get-contract-owner',
        [],
        deployer,
      );
      expect(newOwner).toBePrincipal(wallet1);
    });

    it('prevents non-owner from setting new owner', () => {
      const { result } = simnet.callPublicFn(
        contract,
        'set-contract-owner',
        [Cl.principal(wallet2)],
        wallet2,
      );
      expect(result).toBeErr(Cl.uint(403)); // ERR-NOT-AUTHORIZED
    });
  });

  describe('set-payout-address', () => {
    it('allows contract owner to set new payout address', () => {
      const { result } = simnet.callPublicFn(
        contract,
        'set-payout-address',
        [Cl.principal(wallet1)],
        deployer,
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify the new payout address
      const { result: newPayoutAddress } = simnet.callReadOnlyFn(
        contract,
        'get-payout-address',
        [],
        deployer,
      );
      expect(newPayoutAddress).toBePrincipal(wallet1);
    });

    it('prevents non-owner from setting payout address', () => {
      const { result } = simnet.callPublicFn(
        contract,
        'set-payout-address',
        [Cl.principal(wallet2)],
        wallet2,
      );
      expect(result).toBeErr(Cl.uint(403)); // ERR-NOT-AUTHORIZED
    });
  });

  describe('read-only functions', () => {
    it('get-contract-owner returns correct owner', () => {
      const { result } = simnet.callReadOnlyFn(
        contract,
        'get-contract-owner',
        [],
        deployer,
      );
      expect(result).toBePrincipal(deployer);
    });

    it('get-payout-address returns correct address', () => {
      const { result } = simnet.callReadOnlyFn(
        contract,
        'get-payout-address',
        [],
        deployer,
      );
      expect(result).toBePrincipal(deployer);
    });
  });

  describe('state changes', () => {
    it('maintains correct state after multiple owner changes', () => {
      // Change owner to wallet1
      simnet.callPublicFn(
        contract,
        'set-contract-owner',
        [Cl.principal(wallet1)],
        deployer,
      );

      // Change owner to wallet2 using wallet1
      simnet.callPublicFn(
        contract,
        'set-contract-owner',
        [Cl.principal(wallet2)],
        wallet1,
      );

      // Verify final owner is wallet2
      const { result } = simnet.callReadOnlyFn(
        contract,
        'get-contract-owner',
        [],
        deployer,
      );
      expect(result).toBePrincipal(wallet2);
    });

    it('maintains correct state after multiple payout address changes', () => {
      // Set initial owner
      simnet.callPublicFn(
        contract,
        'set-contract-owner',
        [Cl.principal(wallet1)],
        deployer,
      );

      // Change payout address multiple times
      simnet.callPublicFn(
        contract,
        'set-payout-address',
        [Cl.principal(wallet2)],
        wallet1,
      );

      // Verify final payout address
      const { result } = simnet.callReadOnlyFn(
        contract,
        'get-payout-address',
        [],
        deployer,
      );
      expect(result).toBePrincipal(wallet2);
    });
  });
});
