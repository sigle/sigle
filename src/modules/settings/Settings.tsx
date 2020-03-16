import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layout';
import { DashboardPageContainer } from '../layout/components/DashboardLayout';
import { DashboardPageTitle } from '../layout/components/DashboardHeader';
import { useAuth } from '../auth/AuthContext';
import { getSettingsFile } from '../../utils';
import { SettingsFile } from '../../types';
import { SettingsForm } from './SettingsForm';

export const Settings = () => {
  const { user } = useAuth();
  const [settingsFile, setSettingsFile] = useState<SettingsFile>();

  useEffect(() => {
    const loadSettings = async () => {
      // TODO try catch
      const settingsFileResponse = await getSettingsFile();
      setSettingsFile(settingsFileResponse);
    };

    loadSettings();
  }, []);

  return (
    <DashboardLayout>
      <DashboardPageContainer>
        <DashboardPageTitle title="Settings" />

        {user && settingsFile && (
          <SettingsForm settings={settingsFile} username={user.username} />
        )}
      </DashboardPageContainer>
    </DashboardLayout>
  );
};
