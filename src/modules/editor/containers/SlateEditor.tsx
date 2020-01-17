import React, { useState } from 'react';
import { toast } from 'react-toastify';
import NProgress from 'nprogress';
import { SlateEditor as Component } from '../components/SlateEditor';
import { Story } from '../../../types';
import { publishStory, unPublishStory } from '../../../utils';

interface Props {
  story: Story;
  onChangeStoryField: (field: string, value: any) => void;
}

export const SlateEditor = ({ story, onChangeStoryField }: Props) => {
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);
  const [unpublishLoading, setUnpublishLoading] = useState(false);

  const handleChangeTitle = (title: string) => {
    onChangeStoryField('title', title);
  };

  const handlePublish = () => {
    setShowPublishDialog(true);
  };

  const handleCancelPublish = () => {
    setShowPublishDialog(false);
  };

  const handleConfirmPublish = async () => {
    setPublishLoading(true);
    NProgress.start();
    try {
      await publishStory(story.id);
      onChangeStoryField('type', 'public');
      toast.success('Story published');
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
    NProgress.done();
    setPublishLoading(false);
    setShowPublishDialog(false);
  };

  const handleUnpublish = () => {
    setShowUnpublishDialog(true);
  };

  const handleCancelUnpublish = () => {
    setShowUnpublishDialog(false);
  };

  const handleConfirmUnpublish = async () => {
    setUnpublishLoading(true);
    NProgress.start();
    try {
      await unPublishStory(story.id);
      onChangeStoryField('type', 'private');
      toast.success('Story unpublished');
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
    NProgress.done();
    setUnpublishLoading(true);
    setShowUnpublishDialog(false);
  };

  return (
    <Component
      story={story}
      onChangeTitle={handleChangeTitle}
      onChangeStoryField={onChangeStoryField}
      showPublishDialog={showPublishDialog}
      publishLoading={publishLoading}
      onPublish={handlePublish}
      onCancelPublish={handleCancelPublish}
      onConfirmPublish={handleConfirmPublish}
      showUnpublishDialog={showUnpublishDialog}
      unpublishLoading={unpublishLoading}
      onUnpublish={handleUnpublish}
      onCancelUnpublish={handleCancelUnpublish}
      onConfirmUnpublish={handleConfirmUnpublish}
    />
  );
};
