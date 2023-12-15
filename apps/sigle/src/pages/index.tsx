import React from 'react';
import { Protected } from '../components/authentication/protected';
import { Home } from '../modules/home';

const HomePage = () => {
  return (
    <Protected>
      <Home type="drafts" />
    </Protected>
  );
};

export default HomePage;
