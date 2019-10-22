import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { config } from '../../../config';

const MeContainer = styled.div`
  ${tw`flex flex-wrap`};
`;

const MeMenu = styled.div`
  ${tw`w-full py-6`};

  @media (min-width: ${config.breakpoints.lg}px) {
    width: 200px;
  }

  ul {
    ${tw`flex justify-around lg:flex-col sticky list-none p-0`};
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
            <Link href="/me">
              <a className={route === '/me' ? 'active' : ''}>
                <span>My stories</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/stats" as="/me/stats">
              <a className={route === '/stats' ? 'active' : ''}>
                <span>Stats</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/settings" as="/me/settings">
              <a className={route === '/settings' ? 'active' : ''}>
                <span>Settings</span>
              </a>
            </Link>
          </li>
        </ul>
      </MeMenu>
      <MeRight>{children}</MeRight>
    </MeContainer>
  );
};
