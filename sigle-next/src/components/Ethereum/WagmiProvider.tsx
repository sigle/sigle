import { ReactNode } from 'react';
import { createClient, WagmiConfig } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { ConnectKitProvider, getDefaultClient } from 'connectkit';

// TODO setup alchemy / infura for production
// TODO setup allowed providers
const chains = [polygon];

const client = createClient(
  getDefaultClient({
    appName: 'Sigle',
    chains,
  })
);

export const WagmiProvider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider
        options={
          {
            // TODO setup disclaimer / privacy policy
            // https://docs.family.co/connectkit/theming#additional-options-example
          }
        }
      >
        {children}
      </ConnectKitProvider>
    </WagmiConfig>
  );
};

export default WagmiProvider;
