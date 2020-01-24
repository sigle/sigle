import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as Fathom from 'fathom-client';
import { Home as Component } from '../components/Home';
import {
  createNewEmptyStory,
  saveStoryFile,
  convertStoryToSubsetStory,
  getStoriesFile,
  saveStoriesFile,
} from '../../../utils';
import { userSession } from '../../../utils/blockstack';
import { StoryFile, SubsetStory, BlockstackUser } from '../../../types';
import { useRouter } from 'next/router';
import { Goals } from '../../../utils/fathom';

interface HomeProps {
  type: 'published' | 'drafts';
}

export const Home = ({ type }: HomeProps) => {
  const router = useRouter();
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [user, setUser] = useState<BlockstackUser | null>(null);
  const [storiesFile, setStoriesFile] = useState<StoryFile | null>(null);
  const [stories, setStories] = useState<SubsetStory[] | null>(null);

  const loadUserData = () => {
    try {
      const user: BlockstackUser = userSession.loadUserData();
      setUser(user);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const loadStoryFile = async () => {
    try {
      const file = await getStoriesFile();
      setStoriesFile(file);
      const filter = type === 'published' ? 'public' : 'private';
      const fileStories = file.stories.filter(s => s.type === filter);
      setStories(fileStories);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadUserData();
    loadStoryFile();
  }, []);

  const handleCreateNewPrivateStory = async () => {
    setLoadingCreate(true);
    try {
      const story = createNewEmptyStory();

      if (storiesFile) {
        storiesFile.stories.unshift(convertStoryToSubsetStory(story));

        await saveStoriesFile(storiesFile);
        await saveStoryFile(story);

        Fathom.trackGoal(Goals.CREATE_NEW_STORY, 0);
        router.push('/stories/[storyId]', `/stories/${story.id}`);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      setLoadingCreate(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Component
      selectedTab={type}
      user={user}
      loadingCreate={loadingCreate}
      onCreateNewPrivateStory={handleCreateNewPrivateStory}
      stories={stories}
      refetchStoriesLists={loadStoryFile}
    />
  );
};
