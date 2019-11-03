import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { Editor as Component } from '../components/Editor';
import { Story } from '../../../types';
import { getStoryFile } from '../../../utils';

export const Editor = () => {
  const router = useRouter();
  const { storyId } = router.query;
  const [loading, setLoading] = useState(true);
  const [story, setStory] = useState<Story | null>(null);

  const loadStoryFile = async () => {
    try {
      const file = await getStoryFile(storyId as string);
      setStory(file);
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

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
    loadStoryFile();
    // eslint-disable-next-line
  }, []);

  return (
    <Component
      loading={loading}
      story={story}
      onChangeStoryField={handleChangeStoryField}
    />
  );
};
