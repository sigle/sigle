import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { Container, Link } from '../components';
import { Header } from '../modules/layout/components/Header';
import { Footer } from '../modules/layout/components/Footer';

// TODO active style
const MeMenu = styled.ul`
  ${tw`flex justify-around`};

  a {
    ${tw`py-2 px-2 block`};
  }
`;

const MeProfile = styled.div`
  img {
    ${tw`w-20 h-20 rounded-full mb-2`};
  }

  h2 {
    ${tw`text-xl`};
  }

  p {
    ${tw`lg:text-sm`};
  }
`;

// TODO protect this page, user needs to be connected
export const Me = () => (
  <React.Fragment>
    <Header />
    <Container>
      <MeMenu>
        <li>
          <Link href="/me">My stories</Link>
        </li>
        <li>
          <Link href="/me/stats">Stats</Link>
        </li>
        <li>
          <Link href="/me/settings">Settings</Link>
        </li>
      </MeMenu>

      <MeProfile>
        <img src="https://source.unsplash.com/random/100x100" alt="TODO" />
        <h2>John Doe</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis
          accumsan arcu.
        </p>
      </MeProfile>
    </Container>
    <Footer />
  </React.Fragment>
);
