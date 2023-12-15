import React from 'react';
import { Protected } from '../components/authentication/protected';
import { UserFeed } from '../modules/feed/Feed';

const HomePage = () => {
  return (
    <Protected>
      <UserFeed />
    </Protected>
  );
};

export default HomePage;
