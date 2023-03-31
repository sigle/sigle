export const sites: {
  [key: string]: {
    username: string;
    name: string;
    description: string;
    avatar: string;
    banner: string;
  };
} = {
  ['blog.sigle.io']: {
    username: 'sigle.btc',
    name: 'Sigle',
    description:
      'The official Sigle blog, an open-source writing platform for web3 content creators.',
    banner: '/websites/blog.sigle.io/banner.png',
    avatar:
      'https://gaia.blockstack.org/hub/1KwTnsTj6Rqm26zRfhJuNdQUG63ieozxbB/photos/settings/1656339625902-logo_dapp_com.jpg',
  },
};

// Add localhost to sites for development
if (process.env.NODE_ENV === 'development') {
  sites['localhost:3000'] = sites['blog.sigle.io'];
}
