import { Story } from '../../../types';
import { migrateContentToVersion2 } from './migrateContentToVersion2';

export const migrationStory = (file: Story): Story => {
  // Migration for version 1 when contentVersion is not set it means it's "1"
  if (!file.contentVersion) {
    file.content = migrateContentToVersion2(file.content);
    file.contentVersion = '2';
  }
  return file;
};
