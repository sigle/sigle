import { SettingsFile } from '../../types';

export const migrationSettings = (
  file?: SettingsFile | null | undefined,
): SettingsFile => {
  // File do not exist on the storage at all
  if (!file) {
    return {};
  }
  return file;
};
