export const sites: {
  [key: string]: {
    address: string;
    username: string;
    banner: string;
    links: { href: string; label: string }[];
    cta?: { href: string; label: string };
  };
} = {
  ['blog.sigle.io']: {
    username: 'sigle.btc',
    address: 'SP2EVYKET55QH40RAZE5PVZ363QX0X6BSRP4C7H0W',
    banner: '/websites/blog.sigle.io/banner.png',
    links: [
      { href: 'https://www.sigle.io/', label: 'Home' },
      { href: 'https://app.sigle.io/explore', label: 'Explore' },
    ],
    cta: { href: 'https://app.sigle.io/', label: 'Get Started' },
  },
  ['blog.nftbot.app']: {
    username: 'nftbotapp.btc',
    address: 'SP3ASYJVXNV10GYE9Y7Y9WFZJ7YVVDVJKTV5SZKTT',
    banner: '/websites/blog.nftbot.app/banner.png',
    links: [
      { href: 'https://www.nftbot.app/#features', label: 'Features' },
      { href: 'https://www.nftbot.app/#pricing', label: 'Pricing' },
    ],
    cta: { href: 'https://www.nftbot.app/', label: 'Visit website' },
  },
  ['updates.liquidium.fi']: {
    username: 'liquidium.btc',
    address: 'SPYHY9MV6S08YJQVW0R400ADXZBBJ0GM096BMY34',
    banner: '/websites/updates.liquidium.fi/banner.png',
    links: [],
    cta: { href: 'https://liquidium.fi/', label: 'Visit Liquidium' },
  },
  ['blog.xn--florpea-9za.es']: {
    username: 'flor.btc',
    address: 'SP1FD33S5AD9MW9C57BN1R4SWMG72M9667J6BZ2P7',
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
    address: 'SP3BCZN307DECNR5PRMV6HY4P37AJ9N48JP0VE547',
    banner: '/websites/bitcoin.21milbtc.blog/banner.jpg',
    links: [],
    cta: {
      href: 'https://calendly.com/bitcoin_apostle/30min?month=2023-04',
      label: 'Contact Me',
    },
  },
  ['blog.jackbinswitch.com']: {
    username: 'jackbinswitch.btc',
    address: 'SPQE3J7XMMK0DN0BWJZHGE6B05VDYQRXRMDV734D',
    banner: '/websites/blog.jackbinswitch.com/banner.png',
    links: [
      {
        href: 'https://jackbinswitch.com/',
        label: 'Home',
      },
      {
        href: 'https://www.youtube.com/watch?v=9oqXZCemj1M&ab_channel=Bitcoinlive',
        label: 'We Are Ready Podcast',
      },
    ],
  },
  ['dutchee.wampastompa.com']: {
    username: 'dutchee.btc',
    address: 'SP339T41DGKV2ZR8ACAT630V8KWJVSJME2MK5ZXCB',
    banner: '/websites/dutchee.wampastompa.com/banner.png',
    links: [],
  },
  ['blog.voidsrus.com']: {
    username: 'exploreadao.id.stx',
    address: 'SP3RBDST6Y8V5DSF5FWYSCSGZ6AR7EA0AW011V2FS',
    banner: '/websites/blog.voidsrus.com/banner.jpg',
    links: [
      {
        href: 'https://www.voidsrus.com',
        label: 'Home',
      },
      {
        href: 'https://www.youtube.com/channel/UC9AwSlISybgTqdI_dtLYF3w',
        label: 'Youtube',
      },
    ],
  },
  ['cuevas.co']: {
    username: 'mitchell.btc',
    address: 'SPSEBFRZZEZSHGRKRR1Z55RX5AWHER3CYM0H9BMW',
    banner: '/websites/cuevas.co/banner.jpg',
    links: [],
    cta: {
      href: 'https://stacks.co/updates',
      label: 'Updates',
    },
  },
  ['newsletter.f3w.xyz']: {
    username: 'f3w.btc',
    address: 'SP321XJEPEBY7GQGJ48Q3V05494BCDPTHR8XS7KJB',
    banner: '/websites/newsletter.f3w.xyz/banner.png',
    links: [
      {
        href: 'https://f3w.xyz/',
        label: 'Home',
      },
      {
        href: 'https://twitter.com/f3wletter',
        label: 'Twitter',
      },
      {
        href: 'mailto:gm@f3w.xyz',
        label: 'Email',
      },
    ],
    cta: {
      href: 'https://blocksurvey.io/survey/p/87048b6c-7c72-4616-af8f-1c4a5e00d5af/r/o',
      label: 'Bookings',
    },
  },
  ['blog.lifeonbtc.xyz']: {
    username: 'lifeon.btc',
    address: 'SP19N6NE3EYCM96N0Y173Z2B61MCPNDT8PQEQY166',
    banner: '/websites/blog.lifeonbtc.xyz/banner.png',
    links: [],
  },
};

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
