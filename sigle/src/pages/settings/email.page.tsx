import React from 'react';
import { Protected } from '../../modules/auth/Protected';
import { PrivateData } from '../../modules/settings/private-data/PrivateData';

const PrivateDataPage = () => {
  return (
    <Protected>
      <PrivateData />
    </Protected>
  );
};

export default PrivateDataPage;
