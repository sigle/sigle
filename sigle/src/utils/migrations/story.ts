import { generateHtml } from '@sigle/slate-to-html';
import { Story } from '../../types';

export const migrationStory = (file: Story): Story => {
  // When contentVersion is not set, it means V1
  if (!file.contentVersion) {
    file.content = generateHtml(file.content);
    file.contentVersion = '2';
  }
  return file;
};
