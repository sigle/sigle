import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { useRouter } from 'next/router';
import { config } from '../../../config';
import { Link } from '../../../components';

const MeContainer = styled.div`
  ${tw`flex flex-wrap`};
`;

const MeMenu = styled.div`
  ${tw`w-full py-6`};

  @media (min-width: ${config.breakpoints.lg}px) {
    width: 200px;
  }

  ul {
    ${tw`flex justify-around lg:flex-col sticky`};
    top: 0;
  }

  a {
    ${tw`py-2 block`};
  }

  .active span {
    ${tw`border-b border-solid border-black font-medium py-1`};
  }
`;

const MeRight = styled.div`
  ${tw`w-full lg:w-3/4 py-6 px-6`};

  @media (min-width: ${config.breakpoints.lg}px) {
    width: calc(100% - 200px);
  }
`;

interface Props {
  children: React.ReactNode;
}

// TODO protect this page, user needs to be connected
export const Me = ({ children }: Props) => {
  const router = useRouter();

  const route = router.pathname;

  return (
    <MeContainer>
      <MeMenu>
        <ul>
          <li>
            <Link href="/me" className={route === '/me' ? 'active' : ''}>
              <span>My stories</span>
            </Link>
          </li>
          <li>
            <Link
              href="/me/stats"
              className={route === '/stats' ? 'active' : ''}
            >
              <span>Stats</span>
            </Link>
          </li>
          <li>
            <Link
              href="/me/settings"
              className={route === '/settings' ? 'active' : ''}
            >
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </MeMenu>
      <MeRight>{children}</MeRight>
    </MeContainer>
  );
};
