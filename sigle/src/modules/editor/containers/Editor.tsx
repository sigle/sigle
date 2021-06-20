import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import * as Sentry from '@sentry/nextjs';
import { Editor as Component } from '../components/Editor';
import { Story } from '../../../types';
import { getStoryFile } from '../../../utils';

export const Editor = () => {
  const router = useRouter();
  const { storyId } = router.query as { storyId: string };
  const [story, setStory] = useState<Story | null>(null);

  const { data, isLoading } = useQuery(
    ['story', storyId],
    () => getStoryFile(storyId),
    {
      enabled: Boolean(storyId),
      cacheTime: 0,
      onError: (error: Error) => {
        Sentry.captureException(error);
        toast.error(error.message || error);
      },
    }
  );

  const handleChangeStoryField = (field: string, value: any) => {
    if (!story) {
      return;
    }

    setStory({
      ...story,
      [field]: value,
    });
  };

  useEffect(() => {
    if (data) {
      setStory(data);
    }
  }, [data]);

  return (
    <Component
      loading={isLoading}
      story={story}
      onChangeStoryField={handleChangeStoryField}
    />
  );
};
