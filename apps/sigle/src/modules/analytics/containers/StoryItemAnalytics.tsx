import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { SubsetStory } from '../../../types';
import { getStoriesFile } from '../../../utils';
import { StoryItemAnalytics as Component } from '../components/StoryItemAnalytics';

const loadStoryFile = async (storyId: string) => {
  try {
    const file = await getStoriesFile();
    const fileStories = file.stories.filter((s) => s.id === storyId);
    return fileStories[0];
  } catch (error) {
    toast.error(error.message);
    throw error;
  }
};

export const StoryItemAnalytics = () => {
  const router = useRouter();
  const { storyId } = router.query;
  const { data: story } = useQuery<SubsetStory>(
    ['loadStoryItem', storyId],
    () => loadStoryFile(storyId as string),
    {},
  );

  return <Component story={story} />;
};
