import React from 'react';
import { Protected } from '../../../components/authentication/protected';
import { CurrentPlan } from '../../../modules/settings/plans/CurrentPlan';

const SettingsPlansPage = () => {
  return (
    <Protected>
      <CurrentPlan />
    </Protected>
  );
};

export default SettingsPlansPage;
