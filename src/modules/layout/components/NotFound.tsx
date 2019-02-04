import React from 'react';
import styled from 'styled-components/macro';
import tw from 'tailwind.macro';
import { Link } from 'react-router-dom';
import jungle from '../../../img/jungle.png';
import { Button, Container } from '../../../components';

const NotFoundContainer = styled(Container)`
  ${tw`mt-8 mb-8 flex flex-col items-center text-center md:flex-row md:text-left`};
`;

const NotFoundTextContainer = styled(Container)`
  ${tw`flex flex-col items-center md:items-start md:pl-8`};
`;

const NotFoundTitle = styled.div`
  ${tw`mb-2 text-5xl`};
  font-family: 'Libre Baskerville', serif;
`;

const NotFoundSubTitle = styled.div`
  ${tw`mb-8 text-3xl`};
  font-family: 'Libre Baskerville', serif;
`;

const NotFoundText = styled.div`
  ${tw`mb-8 text-base`};
`;

const NotFoundIllu = styled.img`
  ${tw`mt-4 mb-4`};
  width: 300px;
  max-width: 100%;
`;

interface Props {
  error: string;
}

export const NotFound = ({ error }: Props) => {
  return (
    <NotFoundContainer>
      <NotFoundIllu src={jungle} alt="One" />
      <NotFoundTextContainer>
        <NotFoundTitle>404 in sight!</NotFoundTitle>
        <NotFoundSubTitle>
          Looks like you and Julia went too far...
        </NotFoundSubTitle>
        <NotFoundText>{error}</NotFoundText>
        <Button as={Link} to="/">
          Go to the app
        </Button>
      </NotFoundTextContainer>
    </NotFoundContainer>
  );
};
