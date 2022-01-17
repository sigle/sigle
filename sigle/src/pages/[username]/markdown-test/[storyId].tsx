import { NextPage } from 'next';
export { getServerSideProps } from '../../../pages-lib/[username]/[storyId]';
import { Story, SettingsFile } from '../../../types';
import Error from '../../../pages/_error';
import { PublicStoryMarkdown } from '../../../modules/publicStory/PublicStoryMarkdown';

interface PublicStoryPageProps {
  statusCode: number | boolean;
  errorMessage?: string | null;
  file: Story | null;
  settings: SettingsFile | null;
}

const PublicStoryPage: NextPage<PublicStoryPageProps> = ({
  statusCode,
  errorMessage,
  file,
  settings,
}) => {
  if (typeof statusCode === 'number') {
    return <Error statusCode={statusCode} errorMessage={errorMessage} />;
  }

  return <PublicStoryMarkdown story={file!} settings={settings!} />;
};

export default PublicStoryPage;
