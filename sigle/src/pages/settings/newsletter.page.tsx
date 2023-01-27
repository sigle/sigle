import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { allowedNewsletterUsers } from '../../config';
import { useAuth } from '../../modules/auth/AuthContext';
import { Protected } from '../../modules/auth/Protected';
import { Newsletter } from '../../modules/settings/newsletter/Newsletter';

const NewsletterPage = () => {
  const router = useRouter();
  const { user, loggingIn } = useAuth();

  useEffect(() => {
    const isNewsletterWhitelisted = allowedNewsletterUsers.includes(
      user?.profile.stxAddress.mainnet || ''
    );
    if (!loggingIn && !isNewsletterWhitelisted) {
      router.push('/');
    }
  }, []);

  return (
    <Protected>
      <Newsletter />
    </Protected>
  );
};

export default NewsletterPage;
