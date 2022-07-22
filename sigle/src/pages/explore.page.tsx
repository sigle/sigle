import React from 'react';
import { Protected } from '../modules/auth/Protected';
import { ExploreUsers } from '../modules/explore/Explore';

const ExplorePage = () => {
  return (
    <Protected>
      <ExploreUsers />
    </Protected>
  );
};

export default ExplorePage;
