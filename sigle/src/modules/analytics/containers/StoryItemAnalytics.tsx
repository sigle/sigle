import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { SubsetStory } from '../../../types';
import { getStoriesFile } from '../../../utils';
import { StoryItemAnalytics as Component } from '../components/StoryItemAnalytics';

interface StorItemAnalyticsProps {
  storyId: string;
}
export const StoryItemAnalytics = ({ storyId }: StorItemAnalyticsProps) => {
  const [stories, setStories] = useState<SubsetStory[] | null>(null);

  const loadStoryFile = async () => {
    try {
      const file = await getStoriesFile();
      const fileStories = file.stories.filter((s) => s.id === storyId);
      setStories(fileStories);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadStoryFile();
  }, []);

  return <Component storyId={storyId} stories={stories} />;
};
