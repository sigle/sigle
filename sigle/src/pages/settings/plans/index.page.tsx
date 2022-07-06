import React from 'react';
import { Protected } from '../../../modules/auth/Protected';
import { CurrentPlan } from '../../../modules/settings/plans/CurrentPlan';

const SettingsPlansPage = () => {
  return (
    <Protected>
      <CurrentPlan />
    </Protected>
  );
};

export default SettingsPlansPage;
