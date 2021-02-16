import { GetServerSideProps } from 'next';
import styled from 'styled-components';
import tw from 'twin.macro';

// Map the domain to the user blockstack id
const customDomains: Record<string, string> = {
  'https://blog.sigle.io': 'leopradel.id.blockstack',
  'http://localhost:3001': 'leopradel.id.blockstack',
};

export const getServerSideProps: GetServerSideProps<{}> = async ({ req }) => {
  const appUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${
    req.headers['host']
  }`;

  const resolvedUsername = customDomains[appUrl];

  // If domain is not allowed, redirect the user to the root domain
  if (!resolvedUsername) {
    return {
      redirect: {
        destination: process.env.APP_URL,
        permanent: false,
      },
      props: {},
    };
  }

  console.log({ resolvedUsername });

  return { props: {} };
};

const Title = styled.h1`
  color: red;
  font-size: 50px;
`;

export default function Home() {
  return (
    <>
      <Title>My page</Title>
      <div
        css={[
          tw`flex flex-col items-center justify-center h-screen`,
          tw`bg-gradient-to-b from-gray-300 to-red-400`,
        ]}
      >
        Yo
      </div>
    </>
  );
}
