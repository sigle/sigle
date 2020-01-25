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
  const [stories, setStories] = useState<SubsetStory[] | null>(null);

  const user = userSession.loadUserData();

  const loadStoryFile = async () => {
    try {
      const file = await getStoriesFile();
      const filter = type === 'published' ? 'public' : 'private';
      const fileStories = file.stories.filter(s => s.type === filter);
      setStories(fileStories);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    loadStoryFile();
  }, []);

  return (
    <Component
      selectedTab={type}
      user={user}
      stories={stories}
      refetchStoriesLists={loadStoryFile}
    />
  );
};
