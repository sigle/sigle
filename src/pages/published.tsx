import React from 'react';
import { Protected } from '../modules/auth/Protected';
import { LoggedIn } from '../modules/layout';
import { Home } from '../modules/home';

const HomePage = () => {
  return (
    <Protected>
      <LoggedIn>
        <Home type="published" />
      </LoggedIn>
    </Protected>
  );
};

export default HomePage;
