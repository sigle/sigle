import React, { useEffect, useState } from 'react';
import { Editor as Component } from '../components/Editor';
import { RouteComponentProps } from 'react-router';
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
      // TODO display nice error
      alert(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStoryFile();
  }, [false]);

  return <Component loading={loading} story={story} />;
};
