import React, { useState } from 'react';
import { toast } from 'react-toastify';
import NProgress from 'nprogress';
import * as Fathom from 'fathom-client';
import posthog from 'posthog-js';
import { useRouter } from 'next/router';
import { SlateEditor as Component } from '../components/SlateEditor';
import { Story } from '../../../types';
import { publishStory, unPublishStory } from '../../../utils';
import { Goals } from '../../../utils/fathom';
import { NewEditor } from '../NewEditor';

interface Props {
  story: Story;
  onChangeStory: (newStory: Story) => void;
  onChangeStoryField: (field: string, value: any) => void;
}

export const SlateEditor = ({
  story,
  onChangeStory,
  onChangeStoryField,
}: Props) => {
  const router = useRouter();
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showPublishedDialog, setShowPublishedDialog] = useState(false);
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
      setShowPublishedDialog(true);
      Fathom.trackGoal(Goals.PUBLISH, 0);
      posthog.capture('publish-story', { id: story.id });
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
    NProgress.done();
    setPublishLoading(false);
    setShowPublishDialog(false);
  };

  const handleClosePublished = () => {
    setShowPublishedDialog(false);
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
      posthog.capture('unpublish-story', { id: story.id });
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
    NProgress.done();
    setUnpublishLoading(false);
    setShowUnpublishDialog(false);
  };

  // Hide the new Editor under a flag until it's ready
  const isExperimentalEditor = router.query.experimentalEditor;
  if (isExperimentalEditor === 'true') {
    return (
      <NewEditor
        story={story}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
      />
    );
  }

  return (
    <Component
      story={story}
      onChangeTitle={handleChangeTitle}
      onChangeStory={onChangeStory}
      showPublishDialog={showPublishDialog}
      publishLoading={publishLoading}
      onPublish={handlePublish}
      onCancelPublish={handleCancelPublish}
      onConfirmPublish={handleConfirmPublish}
      showPublishedDialog={showPublishedDialog}
      onClosePublished={handleClosePublished}
      showUnpublishDialog={showUnpublishDialog}
      unpublishLoading={unpublishLoading}
      onUnpublish={handleUnpublish}
      onCancelUnpublish={handleCancelUnpublish}
      onConfirmUnpublish={handleConfirmUnpublish}
    />
  );
};
