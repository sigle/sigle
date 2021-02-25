import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { DashboardLayout } from '../layout';
import { DashboardPageContainer } from '../layout/components/DashboardLayout';
import { DashboardPageTitle } from '../layout/components/DashboardHeader';
import { useAuth } from '../auth/AuthContext';
import { getSettingsFile } from '../../utils';
import { SettingsFile } from '../../types';
import { SettingsForm } from './SettingsForm';
import { SettingsActivateSupporter } from './SettingsActivateSupporter';

export const Settings = () => {
  const { user } = useAuth();
  const [settingsFile, setSettingsFile] = useState<SettingsFile>();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsFileResponse = await getSettingsFile();
        setSettingsFile(settingsFileResponse);
      } catch (error) {
        console.error(error);
        toast.error(error.message);
      }
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

        <SettingsActivateSupporter />
      </DashboardPageContainer>
    </DashboardLayout>
  );
};
