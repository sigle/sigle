import { Cl } from '@stacks/transactions';
import { describe, expect, it } from 'vitest';

const contract = 'sigle-profiles';
const accounts = simnet.getAccounts();
const wallet1 = accounts.get('wallet_1')!;
const wallet2 = accounts.get('wallet_2')!;

describe(contract, () => {
  describe('set-profile', () => {
    it('allows setting a profile URI', () => {
      const uri = 'https://example.com/profile';
      const { result } = simnet.callPublicFn(
        contract,
        'set-profile',
        [Cl.stringAscii(uri)],
        wallet1,
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify the profile was set correctly
      const { result: profile } = simnet.callReadOnlyFn(
        contract,
        'get-profile',
        [Cl.principal(wallet1)],
        wallet1,
      );
      expect(profile).toBeOk(Cl.some(Cl.stringAscii(uri)));
    });

    it('allows updating an existing profile URI', () => {
      const initialUri = 'https://example.com/profile1';
      const updatedUri = 'https://example.com/profile2';

      // Set initial URI
      simnet.callPublicFn(
        contract,
        'set-profile',
        [Cl.stringAscii(initialUri)],
        wallet1,
      );

      // Update URI
      const { result } = simnet.callPublicFn(
        contract,
        'set-profile',
        [Cl.stringAscii(updatedUri)],
        wallet1,
      );
      expect(result).toBeOk(Cl.bool(true));

      // Verify the profile was updated
      const { result: profile } = simnet.callReadOnlyFn(
        contract,
        'get-profile',
        [Cl.principal(wallet1)],
        wallet1,
      );
      expect(profile).toBeOk(Cl.some(Cl.stringAscii(updatedUri)));
    });

    it('handles empty URI', () => {
      const emptyUri = '';
      const { result } = simnet.callPublicFn(
        contract,
        'set-profile',
        [Cl.stringAscii(emptyUri)],
        wallet1,
      );
      expect(result).toBeOk(Cl.bool(true));
    });
  });

  describe('get-profile', () => {
    it('returns none for unset profiles', () => {
      const { result } = simnet.callReadOnlyFn(
        contract,
        'get-profile',
        [Cl.principal(wallet2)],
        wallet2,
      );
      expect(result).toBeOk(Cl.none());
    });

    it('returns correct profile URI for set profiles', () => {
      const uri = 'https://example.com/profile';

      // Set profile
      simnet.callPublicFn(
        contract,
        'set-profile',
        [Cl.stringAscii(uri)],
        wallet1,
      );

      // Get profile
      const { result } = simnet.callReadOnlyFn(
        contract,
        'get-profile',
        [Cl.principal(wallet1)],
        wallet1,
      );
      expect(result).toBeOk(Cl.some(Cl.stringAscii(uri)));
    });
  });
});
