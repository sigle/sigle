import { DIDSession } from 'did-session';
import { StacksWebAuth, getAccountIdByNetwork } from '@didtools/pkh-stacks';
import { createContext, useState, useMemo } from 'react';
import { useAccount } from '@micro-stacks/react';
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
  const { stxAddress } = useAccount();
  const setEnvironment = useRelayStore((store) => store.setEnvironment);

  useEffect(() => {
    loadSession();
  }, [stxAddress]);

  const loadSession = async () => {
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

  const connect = async () => {
    if (!stxAddress) return;

    const stacksProvider = window.StacksProvider;
    const accountId = getAccountIdByNetwork('mainnet', stxAddress);
    const authMethod = await StacksWebAuth.getAuthMethod(
      stacksProvider,
      accountId
    );
    const session = await DIDSession.authorize(authMethod, {
      resources: [`ceramic://*`],
      // 30 days sessions
      expiresInSecs: 60 * 60 * 24 * 30,
    });

    // Store the session in local storage
    const sessionString = session.serialize();
    localStorage.setItem(getStorageKey(stxAddress), sessionString);

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
