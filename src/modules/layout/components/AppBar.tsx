import React from 'react';
import { Link } from 'react-router-dom';
import * as blockstack from 'blockstack';
import styled from 'styled-components/macro';
import tw from 'tailwind.macro';
import { IoIosEye } from 'react-icons/io';
import { Container } from '../../../components';
import { BlockstackUser } from '../../../types';

const StyledContainer = styled(Container)`
  ${tw`flex justify-between py-4`};
`;

const Logo = styled.img`
  height: 45px;
`;

const RightContainer = styled.div`
  ${tw`flex justify-between items-center`};
`;

const Name = styled.a`
  ${tw`mr-8 flex items-center cursor-pointer text-black no-underline`};
`;

const Logout = styled.div`
  ${tw`font-semibold cursor-pointer`}
`;

interface Props {
  user: BlockstackUser;
}

export const AppBar = ({ user }: Props) => {
  const handleLogout = () => {
    blockstack.signUserOut(window.location.origin);
  };

  return (
    <StyledContainer>
      <Link to="/">
        <Logo src="/img/logo.svg" alt="logo" />
      </Link>
      <RightContainer>
        <Name href={`/${user.username}`} target="_blank">
          <IoIosEye size={22} style={{ marginRight: 6 }} /> {user.username}
        </Name>
        <Logout onClick={handleLogout}>Logout</Logout>
      </RightContainer>
    </StyledContainer>
  );
};
