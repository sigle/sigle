import React from 'react';
import { Protected } from '../../modules/auth/Protected';
import { Newsletter } from '../../modules/settings/newsletter/Newsletter';

const NewsletterPage = () => {
  return (
    <Protected>
      <Newsletter />
    </Protected>
  );
};

export default NewsletterPage;
