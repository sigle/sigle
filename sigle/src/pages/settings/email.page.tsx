import React from 'react';
import { Protected } from '../../modules/auth/Protected';
import { EmailData } from '../../modules/settings/email/EmailData';

const PrivateDataPage = () => {
  return (
    <Protected>
      <EmailData />
    </Protected>
  );
};

export default PrivateDataPage;
