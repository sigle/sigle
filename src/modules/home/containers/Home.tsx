import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Home as Component } from '../components/Home';
import {
  createNewEmptyStory,
  saveStoryFile,
  convertStoryToSubsetStory,
  history,
  getStoriesFile,
  saveStoriesFile,
} from '../../../utils';
import { StoryFile, SubsetStory } from '../../../types';

type Tab = 'published' | 'drafts';

export const Home = () => {
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [selectedTab, setSelectedTab] = useState<Tab>('drafts');
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
    loadStoryFile();
  }, [false]);

  const handleCreateNewPrivateStory = async () => {
    setLoadingCreate(true);
    try {
      const story = createNewEmptyStory();

      if (storiesFile) {
        storiesFile.stories.unshift(convertStoryToSubsetStory(story));

        await saveStoriesFile(storiesFile);
        await saveStoryFile(story);

        history.push(`/stories/${story.id}`);
      }
    } catch (error) {
      toast.error(error.message);
      setLoadingCreate(false);
    }
  };

  return (
    <Component
      selectedTab={selectedTab}
      onSelectTab={handleSelectTab}
      loadingCreate={loadingCreate}
      onCreateNewPrivateStory={handleCreateNewPrivateStory}
      privateStories={privateStories}
      publicStories={publicStories}
      onPublish={handlePublish}
      onUnPublish={handleUnPublish}
    />
  );
};
