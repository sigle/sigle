import { DIDSession } from 'did-session';
import { EthereumWebAuth, getAccountId } from '@didtools/pkh-ethereum';
import { createContext, useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';
import { useContext } from 'react';
import { composeClient } from '@/utils';

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
  const { address, connector } = useAccount();

  useEffect(() => {
    loadSession();
  }, [address, connector]);

  // Listen to the session changes to update the composeBB client DID
  useEffect(() => {
    if (!session) return;
    composeClient.setDID(session.did);
  }, [session]);

  const loadSession = async () => {
    if (!address) return;

    const sessionString = localStorage.getItem(getStorageKey(address));
    if (sessionString) {
      const session = await DIDSession.fromSession(sessionString);
      if (session && session.hasSession && !session.isExpired) {
        setSession(session);
        return;
      }
    }

    // TODO connect should be moved to another auth provider
    // that listen to the account change
    await connect();
  };

  const connect = async () => {
    if (!address || !connector) return;
    const ethProvider = await connector.getProvider();

    const accountId = await getAccountId(ethProvider, address);
    const authMethod = await EthereumWebAuth.getAuthMethod(
      ethProvider,
      accountId
    );
    const session = await DIDSession.authorize(authMethod, {
      resources: [`ceramic://*`],
      // 30 days sessions
      expiresInSecs: 60 * 60 * 24 * 30,
    });

    // Store the session in local storage
    const sessionString = session.serialize();
    localStorage.setItem(getStorageKey(address), sessionString);

    setSession(session);
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
