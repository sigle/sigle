import React from 'react';
import { Protected } from '../modules/auth/Protected';
import { LoggedIn, Footer } from '../modules/layout';
import { Home } from '../modules/home';

const HomePage = () => {
  return (
    <Protected>
      <LoggedIn>
        <Home />
        <Footer />
      </LoggedIn>
    </Protected>
  );
};

export default HomePage;
