import { Environment, Network, RecordSource, Store } from 'relay-runtime';
import { create } from 'zustand';
import { composeClient } from '@/lib/composeDB';

const relayNetwork = Network.create(async (request, variables) => {
  return (await composeClient.executeQuery(request.text!, variables)) as any;
});

export const createNewEnvironment = () => {
  return new Environment({
    network: relayNetwork,
    store: new Store(new RecordSource()),
  });
};

interface RelayState {
  environment: Environment;
  setEnvironment: (environment: Environment) => void;
}

export const useRelayStore = create<RelayState>()((set) => ({
  environment: createNewEnvironment(),
  setEnvironment: (environment) => set(() => ({ environment })),
}));
