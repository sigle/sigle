import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import Link from 'next/link';
import { Button, Container } from '../components';
import { config } from '../config';

const NotFoundContainer = styled(Container)`
  ${tw`mt-8 mb-8 flex flex-col items-center text-center md:flex-row md:text-left`};
`;

const NotFoundTextContainer = styled(Container)`
  ${tw`flex flex-col items-center md:items-start md:pl-8`};
`;

const NotFoundTitle = styled.div`
  ${tw`mb-2 text-5xl`};
`;

const NotFoundSubTitle = styled.div`
  ${tw`mb-8 text-3xl`};
`;

const NotFoundIllu = styled.img`
  ${tw`mt-4 mb-4`};
  width: 300px;
  max-width: 100%;

  @media (min-width: ${config.breakpoints.md}px) {
    width: 520px;
  }
`;

interface ErrorProps {
  statusCode: number;
}

const Error = ({ statusCode }: ErrorProps) => {
  return (
    <NotFoundContainer>
      <NotFoundIllu src="/static/img/jungle.png" alt="One" />
      <NotFoundTextContainer>
        <NotFoundTitle>{statusCode} in sight!</NotFoundTitle>
        <NotFoundSubTitle>
          Looks like you and Julia went too far...
        </NotFoundSubTitle>
        <Link href="/">
          <Button as="a">Go to the app</Button>
        </Link>
      </NotFoundTextContainer>
    </NotFoundContainer>
  );
};

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
