import React from 'react';
import { toast } from 'react-toastify';
import { useQuery } from 'react-query';
import * as Sentry from '@sentry/nextjs';
import { DashboardPageTitle } from '../layout/components/DashboardHeader';
import { useAuth } from '../auth/AuthContext';
import { getSettingsFile } from '../../utils';
import { SettingsForm } from './SettingsForm';
import { DashboardLayout } from '../layout/components/DashboardLayout';
import { Box } from '../../ui';

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
      <DashboardPageTitle title="Settings" />
      <Box css={{ width: '100%' }}>
        {user && settingsFile && (
          <SettingsForm settings={settingsFile} username={user.username} />
        )}
      </Box>
    </DashboardLayout>
  );
};
