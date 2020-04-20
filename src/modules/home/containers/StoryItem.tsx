import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import NProgress from 'nprogress';
import { StoryItem as Component } from '../components/StoryItem';
import { SubsetStory, BlockstackUser, Story } from '../../../types';
import {
  deleteStoryFile,
  saveStoriesFile,
  getStoriesFile,
  getStoryFile,
  saveStoryFile,
} from '../../../utils';

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showFeatureDialog, setShowFeatureDialog] = useState(false);
  const [featureLoading, setFeatureLoading] = useState(false);

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

  const handleFeature = async () => {
    setShowFeatureDialog(true);
  };

  const handleConfirmFeature = async () => {
    setFeatureLoading(true);
    NProgress.start();
    try {
      const file = await getStoriesFile();
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
      file.stories[index].featured = true;
      await saveStoriesFile(file);
      const storyFile = (await getStoryFile(story.id)) as Story;
      storyFile.featured = true;
      await saveStoryFile(storyFile);
      await refetchStoriesLists();
    } catch (error) {
      toast.error(error.message);
    }
    NProgress.done();
    setFeatureLoading(false);
    setShowFeatureDialog(false);
  };

  const handleCancelFeature = () => {
    setShowFeatureDialog(false);
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
    />
  );
};
