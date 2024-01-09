import React from 'react';
import { Analytics } from '../../modules/analytics/containers/Analytics';
import { Protected } from '../../components/authentication/protected';

const AnalyticsPage = () => {
  return (
    <Protected>
      <Analytics />
    </Protected>
  );
};

export default AnalyticsPage;
