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
      // Inicio - florpeña.es/bienvenida,
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
        label: 'Mis NFTs en Layer',
      },
      {
        href: 'https://gamma.io/flor.btc',
        label: 'Mis NFTs en Gamma',
      },
      { href: 'https://flowernft.es', label: 'Camisetas' },
      { href: 'https://www.amazon.com/shop/florpena', label: 'Cuadernos' },
      { href: 'mailto:soporteflorpc@gmail.com', label: 'Contacto' },
    ],
    cta: { href: 'https://flowernft.es', label: '¡Conoce mi tienda aquí!' },
  },
};

// Add localhost to sites for development
if (process.env.NODE_ENV === 'development') {
  sites['localhost:3000'] = sites['blog.xn--florpea-9za.es'];
}
