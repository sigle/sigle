import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { Protected } from '../../modules/auth/Protected';
import { PrivateData } from '../../modules/settings/private-data/PrivateData';
import { useFeatureFlags } from '../../utils/featureFlags';

const PrivateDataPage = () => {
  const router = useRouter();
  const { isExperimentalNewsletterEnabled } = useFeatureFlags();

  useEffect(() => {
    if (!isExperimentalNewsletterEnabled) {
      router.push('/');
    }
  }, []);

  return (
    <Protected>
      <PrivateData />
    </Protected>
  );
};

export default PrivateDataPage;
