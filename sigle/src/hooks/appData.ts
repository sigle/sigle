import { useQuery } from 'react-query';
import { getSettingsFile } from '../utils';

export const useGetUserSettings = () =>
  useQuery('user-settings', () => getSettingsFile());
