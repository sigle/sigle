import React from 'react';
import { Protected } from '../modules/auth/Protected';
import { UserFeed } from '../modules/feed/Feed';

const HomePage = () => {
  return (
    <Protected>
      <UserFeed />
    </Protected>
  );
};

export default HomePage;
