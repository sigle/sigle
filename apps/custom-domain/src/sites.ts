export const sites: {
  [key: string]: {
    username: string;
    banner: string;
    links: { href: string; label: string }[];
    cta?: { href: string; label: string };
  };
} = {
  ['blog.sigle.io']: {
    username: 'sigle.btc',
    banner: '/websites/blog.sigle.io/banner.png',
    links: [
      { href: 'https://www.sigle.io/', label: 'Home' },
      { href: 'https://app.sigle.io/explore', label: 'Explore' },
    ],
    cta: { href: 'https://app.sigle.io/', label: 'Get Started' },
  },
  ['blog.nftbot.app']: {
    username: 'nftbotapp.btc',
    banner: '/websites/blog.nftbot.app/banner.png',
    links: [
      { href: 'https://www.nftbot.app/#features', label: 'Features' },
      { href: 'https://www.nftbot.app/#pricing', label: 'Pricing' },
    ],
    cta: { href: 'https://www.nftbot.app/', label: 'Visit website' },
  },
  ['updates.liquidium.fi']: {
    username: 'liquidium.btc',
    banner: '/websites/updates.liquidium.fi/banner.png',
    links: [],
    cta: { href: 'https://liquidium.fi/', label: 'Visit Liquidium' },
  },
  ['blog.xn--florpea-9za.es']: {
    username: 'flor.btc',
    banner: '/websites/blog.xn--florpea-9za.es/banner.png',
    links: [
      {
        href: 'https://florpeña.es/bienvenida',
        label: 'Inicio',
      },
      {
        href: 'https://app.sigle.io/flor.btc/72KIJ7Xh6drKa7b1RqJrl',
        label: 'Sobre mi',
      },
      {
        href: 'https://marketplace.heylayer.com/flower',
        label: 'My Layer',
      },
      {
        href: 'https://gamma.io/flor.btc',
        label: 'My Gamma',
      },
      { href: 'https://flowernft.es', label: 'Camisetas' },
      { href: 'https://www.amazon.com/shop/florpena', label: 'Cuadernos' },
    ],
    cta: { href: 'https://flowernft.es', label: '¡Conoce mi tienda aquí!' },
  },
  ['bitcoin.21milbtc.blog']: {
    username: '21milbtc.btc',
    banner: '/websites/bitcoin.21milbtc.blog/banner.jpg',
    links: [],
    cta: {
      href: 'https://calendly.com/bitcoin_apostle/30min?month=2023-04',
      label: 'Contact Me',
    },
  },
};

console.log({
  vercelEnv: process.env.VERCEL_ENV,
  vercelUrl: process.env.VERCEL_URL,
  vercelGitRepoSlug: `custom-domain-git-${process.env.VERCEL_GIT_COMMIT_REF?.replace(
    '/',
    '-'
  )}-${process.env.VERCEL_GIT_REPO_OWNER}.vercel.app`,
});

// Add localhost to sites for development
if (process.env.NODE_ENV === 'development') {
  sites['localhost:3000'] = sites['blog.sigle.io'];
} else if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) {
  // Preview deployments
  sites[process.env.VERCEL_URL] = sites['blog.sigle.io'];
  sites[
    `custom-domain-git-${process.env.VERCEL_GIT_COMMIT_REF?.replace(
      '/',
      '-'
    )}-${process.env.VERCEL_GIT_REPO_OWNER}.vercel.app`
  ] = sites['blog.sigle.io'];
}
