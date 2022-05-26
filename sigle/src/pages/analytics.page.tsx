import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { Analytics } from '../modules/analytics/containers/Analytics';
import { Protected } from '../modules/auth/Protected';
import { useFeatureFlags } from '../utils/featureFlags';

const AnalyticsPage = () => {
  const router = useRouter();
  const { isExperimentalAnalyticsPageEnabled } = useFeatureFlags();

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
