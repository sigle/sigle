import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { Analytics } from '../../modules/analytics/containers/Analytics';
import { Protected } from '../../modules/auth/Protected';
import { isExperimentalAnalyticsPageEnabled } from '../../utils/featureFlags';

const AnalyticsPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (!isExperimentalAnalyticsPageEnabled) {
      router.push('/');
    }
  }, []);

  return (
    <Protected>
      <Analytics />
    </Protected>
  );
};

export default AnalyticsPage;
