import React from 'react';
import { Protected } from '../../components/authentication/protected';
import { Newsletter } from '../../modules/settings/newsletter/Newsletter';

const NewsletterPage = () => {
  return (
    <Protected>
      <Newsletter />
    </Protected>
  );
};

export default NewsletterPage;
