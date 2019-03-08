import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import tw from 'tailwind.macro';
import Tippy from '@tippy.js/react';
import { IoIosEye } from 'react-icons/io';
import { userSession } from '../../../utils/blockstack';
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
    userSession.signUserOut();
    window.location.replace(window.location.origin);
  };

  return (
    <StyledContainer>
      <Link to="/">
        <Logo src="/img/logo.svg" alt="logo" />
      </Link>
      <RightContainer>
        <Tippy
          content={user.username}
          arrow={true}
          arrowType="round"
          theme="light-border"
        >
          <Name href={`/${user.username}`} target="_blank">
            <IoIosEye size={22} style={{ marginRight: 6 }} /> Visit my blog
          </Name>
        </Tippy>
        <Logout onClick={handleLogout}>Logout</Logout>
      </RightContainer>
    </StyledContainer>
  );
};
