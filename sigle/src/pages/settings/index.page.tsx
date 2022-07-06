import React from 'react';
import { Protected } from '../../modules/auth/Protected';
import { Settings } from '../../modules/settings/Settings';

const SettingsPage = () => {
  return (
    <Protected>
      <Settings />
    </Protected>
  );
};

export default SettingsPage;
