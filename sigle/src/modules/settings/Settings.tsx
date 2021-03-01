import React from 'react';
import { toast } from 'react-toastify';
import { useQuery } from 'react-query';
import * as Sentry from '@sentry/node';
import { DashboardLayout } from '../layout';
import { DashboardPageContainer } from '../layout/components/DashboardLayout';
import { DashboardPageTitle } from '../layout/components/DashboardHeader';
import { useAuth } from '../auth/AuthContext';
import { getSettingsFile } from '../../utils';
import { SettingsForm } from './SettingsForm';
import { SettingsActivateSupporter } from './SettingsActivateSupporter';

export const Settings = () => {
  const { user } = useAuth();

  const { data: settingsFile } = useQuery(
    'user-settings',
    () => getSettingsFile(),
    {
      cacheTime: 0,
      onError: (error: Error) => {
        Sentry.captureException(error);
        toast.error(error.message || error);
      },
    }
  );

  return (
    <DashboardLayout>
      <DashboardPageContainer>
        <DashboardPageTitle title="Settings" />

        {user && settingsFile && (
          <SettingsForm settings={settingsFile} username={user.username} />
        )}

        <SettingsActivateSupporter />
      </DashboardPageContainer>
    </DashboardLayout>
  );
};
