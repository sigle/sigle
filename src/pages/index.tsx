import React from 'react';
import { Protected } from '../modules/auth/Protected';
import { DashboardLayout } from '../modules/layout';
import { Home } from '../modules/home';

const HomePage = () => {
  return (
    <Protected>
      <DashboardLayout>
        <Home type="drafts" />
      </DashboardLayout>
    </Protected>
  );
};

export default HomePage;
