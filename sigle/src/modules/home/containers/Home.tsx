import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Home as Component } from '../components/Home';
import { getStoriesFile } from '../../../utils';
import { SubsetStory } from '../../../types';
import { useAuth } from '../../auth/AuthContext';

interface HomeProps {
  type: 'published' | 'drafts';
}

export const Home = ({ type }: HomeProps) => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<SubsetStory[] | null>(null);

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

  if (!user) {
    return null;
  }

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
