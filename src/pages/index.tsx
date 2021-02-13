import React from 'react';
import { GetServerSideProps } from 'next';
import { Protected } from '../modules/auth/Protected';
import { Home } from '../modules/home';

// Map the domain to the user blockstack id
const customDomains: Record<string, string> = {
  'https://blog.sigle.io': 'leopradel.id.blockstack',
};

export const getServerSideProps: GetServerSideProps<{}> = async ({ req }) => {
  const appUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${
    req.headers['host']
  }`;

  // If domain is not allowed, redirect the user to the root domain
  if (appUrl !== process.env.APP_URL && !customDomains[appUrl]) {
    return {
      redirect: {
        destination: process.env.APP_URL,
        permanent: false,
      },
      props: {},
    };
  }

  return { props: {} };
};

const HomePage = () => {
  return (
    <Protected>
      <Home type="drafts" />
    </Protected>
  );
};

export default HomePage;
