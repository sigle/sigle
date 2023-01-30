export const sigleConfig = {
  env: process.env.NODE_ENV,
  isServer: typeof window === 'undefined',
  appUrl: process.env.APP_URL as string,
  apiUrl: process.env.API_URL,
  landingUrl: 'https://www.sigle.io',
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  fathomSiteId: process.env.FATHOM_SITE_ID,
  fathomSiteUrl: 'https://louse.sigle.io/script.js',
  posthogToken: process.env.NEXT_PUBLIC_POSTHOG_TOKEN,
  githubUrl: 'https://github.com/sigle/sigle',
  twitterUrl: 'https://twitter.com/sigleapp',
  discordUrl: 'https://discord.gg/X2Dbz3xbrs',
  messengerUrl: 'https://m.me/sigleapp',
  documentationUrl: 'https://docs.sigle.io',
  explorerGuildUrl: 'https://www.explorerguild.io',
  feedbackUrl: 'https://sigle.canny.io/feature-requests',
  blogUrl: 'https://app.sigle.io/sigle.btc',
  gammaUrl: 'https://gamma.io/collections/the-explorer-guild',
  email: 'sigle@protonmail.com',
};

// Production list
export const allowedNewsletterUsers = [
  // sigle.btc
  'SP2EVYKET55QH40RAZE5PVZ363QX0X6BSRP4C7H0W',
  // leopradel.btc
  'SP3VCX5NFQ8VCHFS9M6N40ZJNVTRT4HZ62WFH5C4Q',
  // quentin.btc
  'SP24GYRG3M7T0S6FZE9RVVP9PNNZQJQ614650G590',
  // Test account
  'SPRG63HF7QJJ8H7JN0DJQZH2P1FCGYVHPYBXMYGB',
  // jackbinswitch.btc
  'SPQE3J7XMMK0DN0BWJZHGE6B05VDYQRXRMDV734D',
  // whenindoubt.btc
  'SP398XE371G08T84A99TCBD8XKWY3S7VVX6JKJWKY',
  // nftclothingclub.btc
  'SP2ABRYMZ38D5BHDMWPX6V0PKYA733W2T755DKQ72',
  // stxldn.btc
  'SPCMGSQF3ME39XN7W6RV4M21HFRHC2BGJH6S07V7',
  // bigrpic.btc
  'SP2H6HVZK6X3Z8F4PKF284AZJR6FH4H9J4W6KVV8T',
  // morguf.btc
  'SP21CYC2GKWTVK3FHFF4VVJNKVNQDMRY5GQS27XQB',
  // friedger.btc
  'SPN4Y5QPGQA8882ZXW90ADC2DHYXMSTN8VAR8C3X',
  // johnd.btc
  'SP14W78Q821B3HQ3ED30624Z1F13X4JMFZY3N5SK4',
  // behindthescenes.btc
  'SP1MX63HP0YD1TFAR0J6N6VYN3KVED5AF5JHPH1B7',
  // wampastompa.btc
  'SP22W7TM6NG3PJ2XVVND2E06D50K3DDNREBTKGFD3',
  // marthafog.btc
  'SP3J4WEWR42Q5919MR8CBV4X4ZC19SSA0Q7PKHZVG',
  // Expresso
  'SP0FK47T9271MJX3HEFKA1MEPD4X39J9DCGVXF2D',
  // 21milbtc.btc
  'SP3BCZN307DECNR5PRMV6HY4P37AJ9N48JP0VE547',
  // goodkitty.btc
  'SP28RZ1QXMXJXVKRRCR3D7GR5D48XY0NNA9MZWHJB',
  // stablesir.btc
  'SP8ZVD9PQ9VP657P670KBCB5ZHMJM9QMNJNFVBS6',
  // dutchee.btc
  'SP339T41DGKV2ZR8ACAT630V8KWJVSJME2MK5ZXCB',
  // xverseapp.id.stx
  'SPNW0Q9NE7GSFH10RKYWEN68FBQ9V5JFWCN8SK31',
  // liquidium.btc
  'SPYHY9MV6S08YJQVW0R400ADXZBBJ0GM096BMY34',
];
if (sigleConfig.env === 'development') {
  // gregogun.btc
  allowedNewsletterUsers.push('SP1F48HCD4SP4HT8BHQPXZ35615764KC80ACNMBDZ');
}
