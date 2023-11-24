import React from 'react';
import { toast } from 'react-toastify';
import { useQuery } from '@tanstack/react-query';
import * as Sentry from '@sentry/nextjs';
import { useAuth } from '../auth/AuthContext';
import { getSettingsFile } from '../../utils';
import { Box } from '../../ui';
import { SettingsForm } from './SettingsForm';
import { SettingsLayout } from './SettingsLayout';

export const Settings = () => {
  const { user } = useAuth();

  const { data: settingsFile } = useQuery(
    ['user-settings'],
    () => getSettingsFile(),
    {
      cacheTime: 0,
      onError: (error: Error | string) => {
        Sentry.captureException(error);
        toast.error(typeof error === 'string' ? error : error.message);
      },
    },
  );

  return (
    <SettingsLayout>
      <Box css={{ width: '100%', pl: 1 }}>
        {user && settingsFile && (
          <SettingsForm settings={settingsFile} username={user.username} />
        )}
      </Box>
    </SettingsLayout>
  );
};
