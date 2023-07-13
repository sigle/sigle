import { DIDSession } from 'did-session';
import {
  StacksWebAuth,
  getAccountIdByNetwork as getStxAccountIdByNetwork,
} from '@didtools/pkh-stacks';
import {
  EthereumWebAuth,
  getAccountId as getEthAccountId,
} from '@didtools/pkh-ethereum';
import type { AuthMethod } from '@didtools/cacao';
import { createContext, useState, useMemo } from 'react';
import { useAccount as useEthereumAccount } from 'wagmi';
import { useAccount as useStackAccount } from '@micro-stacks/react';
import { useEffect, useContext } from 'react';
import { composeClient } from '@/lib/composeDB';
import { createNewEnvironment, useRelayStore } from '@/lib/relay';

interface CeramicContextType {
  session: DIDSession | null;
  connect: () => Promise<void>;
}

const CeramicContext = createContext<CeramicContextType>(
  {} as CeramicContextType
);

const getStorageKey = (address: string) => `did-session:${address}`;

interface CeramicProviderProps {
  children: React.ReactNode;
}

const CeramicProvider = ({ children }: CeramicProviderProps) => {
  const [session, setSession] = useState<DIDSession | null>(null);
  const { address: ethAddress, connector } = useEthereumAccount();
  const { stxAddress } = useStackAccount();
  const setEnvironment = useRelayStore((store) => store.setEnvironment);
  // Normalize the address to lowercase to avoid missmatch issues
  const normalizedEthAddress = ethAddress?.toLowerCase();

  useEffect(() => {
    loadSessionStacks();
  }, [stxAddress]);

  useEffect(() => {
    loadSessionEthereum();
  }, [normalizedEthAddress, connector]);

  const loadSessionStacks = async () => {
    if (!stxAddress) return;

    const sessionString = localStorage.getItem(getStorageKey(stxAddress));
    if (sessionString) {
      const session = await DIDSession.fromSession(sessionString);
      if (session && session.hasSession && !session.isExpired) {
        composeClient.setDID(session.did);
        setSession(session);
        // Reset the relay environment to rerun all the queries as authenticated
        setEnvironment(createNewEnvironment());
        return;
      }
    }

    // TODO connect should be moved to another auth provider
    // that listen to the account change
    await connect();
  };

  const loadSessionEthereum = async () => {
    if (!normalizedEthAddress) return;

    const sessionString = localStorage.getItem(
      getStorageKey(normalizedEthAddress)
    );
    if (sessionString) {
      const session = await DIDSession.fromSession(sessionString);
      if (session && session.hasSession && !session.isExpired) {
        composeClient.setDID(session.did);
        setSession(session);
        // Reset the relay environment to rerun all the queries as authenticated
        setEnvironment(createNewEnvironment());
        return;
      }
    }

    // TODO connect should be moved to another auth provider
    // that listen to the account change
    await connect();
  };

  const connect = async () => {
    if (!stxAddress && (!normalizedEthAddress || !connector)) return;

    let authMethod: AuthMethod;
    if (stxAddress) {
      const stacksProvider = window.StacksProvider;
      const accountId = getStxAccountIdByNetwork('mainnet', stxAddress);
      authMethod = await StacksWebAuth.getAuthMethod(stacksProvider, accountId);
    } else {
      const ethProvider = await connector!.getProvider();
      const accountId = await getEthAccountId(
        ethProvider,
        normalizedEthAddress!
      );
      authMethod = await EthereumWebAuth.getAuthMethod(ethProvider, accountId);
    }

    const session = await DIDSession.authorize(authMethod, {
      resources: [`ceramic://*`],
      // 30 days sessions
      expiresInSecs: 60 * 60 * 24 * 30,
    });

    // Store the session in local storage
    const sessionString = session.serialize();
    localStorage.setItem(
      getStorageKey(stxAddress || normalizedEthAddress!),
      sessionString
    );

    composeClient.setDID(session.did);
    setSession(session);
    // Reset the relay environment to rerun all the queries as authenticated
    setEnvironment(createNewEnvironment());
  };

  const memoedValue = useMemo(
    () => ({
      connect,
      session,
    }),
    [connect, session]
  );

  return (
    <CeramicContext.Provider value={memoedValue}>
      {children}
    </CeramicContext.Provider>
  );
};

export function useCeramic() {
  return useContext(CeramicContext);
}

export default CeramicProvider;
