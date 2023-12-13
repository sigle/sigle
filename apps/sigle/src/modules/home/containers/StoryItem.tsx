import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import NProgress from 'nprogress';
import { fetchStoriesControllerDelete } from '@/__generated__/sigle-api';
import { StoryItem as Component } from '../components/StoryItem';
import { SubsetStory, BlockstackUser, Story } from '../../../types';
import {
  deleteStoryFile,
  saveStoriesFile,
  getStoriesFile,
  getStoryFile,
  saveStoryFile,
} from '../../../utils';
import { useAuth } from '../../auth/AuthContext';

interface Props {
  user: BlockstackUser;
  story: SubsetStory;
  type: 'public' | 'private';
  refetchStoriesLists: () => Promise<void>;
}

export const StoryItem = ({
  user,
  story,
  type,
  refetchStoriesLists,
}: Props) => {
  const router = useRouter();
  const { isLegacy } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [featureLoading, setFeatureLoading] = useState(false);
  const [showUnFeatureDialog, setShowUnFeatureDialog] = useState(false);
  const [unFeatureLoading, setUnFeatureLoading] = useState(false);

  const handleEdit = () => {
    router.push('/stories/[storyId]', `/stories/${story.id}`);
  };

  const handleDelete = async () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteLoading(true);
    NProgress.start();
    try {
      const file = await getStoriesFile();
      const index = file.stories.findIndex((s) => s.id === story.id);
      if (index === -1) {
        throw new Error('File not found in list');
      }
      file.stories.splice(index, 1);
      await saveStoriesFile(file);
      await deleteStoryFile(story);
      await refetchStoriesLists();
      if (!isLegacy) {
        await fetchStoriesControllerDelete({
          body: { id: story.id },
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
    NProgress.done();
    setDeleteLoading(false);
    setShowDeleteDialog(false);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const setFeaturedStory = async (featured: boolean) => {
    if (featured) {
      setFeatureLoading(true);
    } else {
      setUnFeatureLoading(true);
    }
    NProgress.start();
    try {
      // We update the new file
      const storyFile = (await getStoryFile(story.id)) as Story;
      storyFile.featured = featured;
      await saveStoryFile(storyFile);

      const file = await getStoriesFile();
      // Only when we feature a new one we need to un-feature the old one, not just the index
      if (featured) {
        const oldFeaturedStory = file.stories.find((story) => story.featured);
        if (oldFeaturedStory) {
          const oldFeaturedStoryFile = (await getStoryFile(
            oldFeaturedStory.id,
          )) as Story;
          oldFeaturedStoryFile.featured = false;
          await saveStoryFile(oldFeaturedStoryFile);
        }
      }

      const index = file.stories.findIndex((s) => s.id === story.id);
      if (index === -1) {
        throw new Error('File not found in list');
      }

      // Only one story can be featured so we remove the old one
      file.stories.forEach((story, index) => {
        if (story.featured) {
          file.stories[index].featured = false;
        }
      });
      file.stories[index].featured = featured;
      await saveStoriesFile(file);

      // We refetch the list to show the latest infos
      await refetchStoriesLists();
    } catch (error) {
      toast.error(error.message);
    }
    NProgress.done();
    if (featured) {
      setFeatureLoading(false);
      setShowFeatureDialog(false);
    } else {
      setUnFeatureLoading(false);
      setShowUnFeatureDialog(false);
    }
  };

  const handleFeature = async () => {
    setShowFeatureDialog(true);
  };

  const handleConfirmFeature = async () => setFeaturedStory(true);

  const handleCancelFeature = () => {
    setShowFeatureDialog(false);
  };

  const handleUnFeature = async () => {
    setShowUnFeatureDialog(true);
  };

  const handleConfirmUnFeature = async () => setFeaturedStory(false);

  const handleCancelUnFeature = () => {
    setShowUnFeatureDialog(false);
  };

  return (
    <Component
      user={user}
      story={story}
      type={type}
      onEdit={handleEdit}
      onDelete={handleDelete}
      showDeleteDialog={showDeleteDialog}
      deleteLoading={deleteLoading}
      onConfirmDelete={handleConfirmDelete}
      onCancelDelete={handleCancelDelete}
      onFeature={handleFeature}
      showFeatureDialog={showFeatureDialog}
      featureLoading={featureLoading}
      onConfirmFeature={handleConfirmFeature}
      onCancelFeature={handleCancelFeature}
      onUnFeature={handleUnFeature}
      showUnFeatureDialog={showUnFeatureDialog}
      unFeatureLoading={unFeatureLoading}
      onConfirmUnFeature={handleConfirmUnFeature}
      onCancelUnFeature={handleCancelUnFeature}
    />
  );
};
