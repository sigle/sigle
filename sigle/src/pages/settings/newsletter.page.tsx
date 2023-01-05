import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { Protected } from '../../modules/auth/Protected';
import { Newsletter } from '../../modules/settings/newsletter/Newsletter';
import { useFeatureFlags } from '../../utils/featureFlags';

const NewsletterPage = () => {
  const router = useRouter();
  const { isExperimentalNewsletterEnabled } = useFeatureFlags();

  // useEffect(() => {
  //   if (!isExperimentalNewsletterEnabled) {
  //     router.push('/');
  //   }
  // }, []);

  return (
    <Protected>
      <Newsletter />
    </Protected>
  );
};

export default NewsletterPage;
