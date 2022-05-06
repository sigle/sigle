import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { SubsetStory } from '../../../types';
import { getStoriesFile } from '../../../utils';
import { Analytics as Component } from '../components/Analytics';

export const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<SubsetStory[] | null>(null);

  const loadStoryFile = async () => {
    try {
      const file = await getStoriesFile();
      const fileStories = file.stories.filter((s) => s.type === 'public');
      setStories(fileStories);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStoryFile();
  }, []);

  return <Component loading={loading} stories={stories} />;
};
