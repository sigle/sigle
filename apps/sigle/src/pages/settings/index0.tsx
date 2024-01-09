import React from 'react';
import { Protected } from '../../components/authentication/protected';
import { Settings } from '../../modules/settings/Settings';

const SettingsPage = () => {
  return (
    <Protected>
      <Settings />
    </Protected>
  );
};

export default SettingsPage;
