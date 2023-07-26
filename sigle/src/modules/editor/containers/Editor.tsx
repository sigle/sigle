import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import * as Sentry from '@sentry/nextjs';
import { Editor as Component } from '../components/Editor';
import { getStoryFile } from '../../../utils';
import { migrationStory } from '../../../utils/migrations/story';

export const Editor = () => {
  const router = useRouter();
  const { storyId } = router.query as { storyId: string };

  const { data, isLoading } = useQuery(
    ['story', storyId],
    async () => {
      const file = await getStoryFile(storyId);
      return file ? migrationStory(file) : file;
    },
    {
      enabled: Boolean(storyId),
      cacheTime: 0,
      onError: (error: Error | string) => {
        Sentry.captureException(error);
        toast.error(typeof error === 'string' ? error : error.message);
      },
    },
  );

  return <Component loading={isLoading} story={data ?? null} />;
};
