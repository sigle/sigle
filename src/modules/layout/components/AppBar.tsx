import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { Container } from '../../../components';

const StyledContainer = styled(Container)`
  ${tw`flex justify-between py-4`};
`;

const Logo = styled.img`
  height: 40px;
`;

export const AppBarRightContainer = styled.div`
  ${tw`flex justify-between items-center`};
`;

interface Props {
  children?: React.ReactNode;
}

export const AppBar = ({ children }: Props) => {
  return (
    <StyledContainer>
      <Link href="/">
        <a>
          <Logo src="/img/logo.png" alt="logo" />
        </a>
      </Link>
      {children}
    </StyledContainer>
  );
};
