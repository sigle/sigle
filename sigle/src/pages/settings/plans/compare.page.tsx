import React from 'react';
import { Protected } from '../../../modules/auth/Protected';
import { ComparePlans } from '../../../modules/settings/plans/ComparePlans';

const SettingsComparePage = () => {
  return (
    <Protected>
      <ComparePlans />
    </Protected>
  );
};

export default SettingsComparePage;
