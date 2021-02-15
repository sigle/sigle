import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Home as Component } from '../components/Home';
import { getStoriesFile } from '../../../utils';
import { userSession } from '../../../utils/blockstack';
import { SubsetStory } from '../../../types';

interface HomeProps {
  type: 'published' | 'drafts';
}

export const Home = ({ type }: HomeProps) => {
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<SubsetStory[] | null>(null);

  const user = userSession.loadUserData();

  const loadStoryFile = async () => {
    try {
      const file = await getStoriesFile();
      const filter = type === 'published' ? 'public' : 'private';
      const fileStories = file.stories.filter((s) => s.type === filter);
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

  return (
    <Component
      selectedTab={type}
      user={user}
      stories={stories}
      loading={loading}
      refetchStoriesLists={loadStoryFile}
    />
  );
};
