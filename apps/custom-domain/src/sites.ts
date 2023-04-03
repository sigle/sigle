import { SiteSettings } from './types';

export const sites: {
  [key: string]: SiteSettings;
} = {
  ['blog.sigle.io']: {
    username: 'sigle.btc',
    name: 'Sigle',
    description:
      'The official Sigle blog, an open-source writing platform for web3 content creators.',
    banner: '/websites/blog.sigle.io/banner.png',
    avatar:
      'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/settings/1656339625902-logo_dapp_com.jpg',
    links: [
      { href: 'https://www.sigle.io/', label: 'Home' },
      { href: 'https://app.sigle.io/explore', label: 'Explore' },
    ],
  },
  ['blog.nftbot.app']: {
    username: 'nftbotapp.btc',
    name: 'NFTBOT.app',
    description:
      'A fast and affordable multi-chain service: NFTBOT is the best way to automate sales alerts for your NFT project on Twitter.',
    banner: '/websites/blog.nftbot.app/banner.png',
    avatar:
      'https://gaia.blockstack.org/hub/1P4Ktt6EbjmBWRxnZUFU7pjvWQcTxXdtfe/photos/settings/1680265571505-pfp_2.jpg',
    links: [
      { href: 'https://www.nftbot.app/#features', label: 'Features' },
      { href: 'https://www.nftbot.app/#pricing', label: 'Pricing' },
    ],
  },
};

// Add localhost to sites for development
if (process.env.NODE_ENV === 'development') {
  sites['localhost:3000'] = sites['blog.nftbot.app'];
}
