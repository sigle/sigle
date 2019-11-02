import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
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

type Tab = 'published' | 'drafts';

export const Home = () => {
  const router = useRouter();
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [selectedTab, setSelectedTab] = useState<Tab>('drafts');
  const [user, setUser] = useState<BlockstackUser | null>(null);
  const [storiesFile, setStoriesFile] = useState<StoryFile | null>(null);
  const [privateStories, setPrivateStories] = useState<SubsetStory[] | null>(
    null
  );
  const [publicStories, setPublicStories] = useState<SubsetStory[] | null>(
    null
  );

  const handleSelectTab = (tab: Tab) => {
    setSelectedTab(tab);
  };

  const loadUserData = async () => {
    try {
      const user: BlockstackUser = await userSession.loadUserData();
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
      const privateStories = file.stories.filter(s => s.type === 'private');
      setPrivateStories(privateStories);
      const publicStories = file.stories.filter(s => s.type === 'public');
      setPublicStories(publicStories);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handlePublish = () => {
    loadStoryFile();
  };

  const handleUnPublish = () => {
    loadStoryFile();
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

        router.push(`/stories/${story.id}`);
      }
    } catch (error) {
      toast.error(error.message);
      setLoadingCreate(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Component
      selectedTab={selectedTab}
      onSelectTab={handleSelectTab}
      user={user}
      loadingCreate={loadingCreate}
      onCreateNewPrivateStory={handleCreateNewPrivateStory}
      privateStories={privateStories}
      publicStories={publicStories}
      onPublish={handlePublish}
      onUnPublish={handleUnPublish}
    />
  );
};
