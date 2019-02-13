import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { RouteComponentProps } from 'react-router';
import { Editor as Component } from '../components/Editor';
import { Story } from '../../../types';
import { getStoryFile } from '../../../utils';

type Props = RouteComponentProps<{ storyId: string }>;

export const Editor = ({ match }: Props) => {
  const storyId = match.params.storyId;
  const [loading, setLoading] = useState(true);
  const [story, setStory] = useState<Story | null>(null);

  const loadStoryFile = async () => {
    try {
      const file = await getStoryFile(storyId);
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
  }, [false]);

  return (
    <Component
      loading={loading}
      story={story}
      onChangeStoryField={handleChangeStoryField}
    />
  );
};
