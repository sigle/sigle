import React, { useState } from 'react';
import { SlateEditor as Component } from '../components/SlateEditor';
import { Story } from '../../../types';

interface Props {
  story: Story;
  onChangeStoryField: (field: string, value: any) => void;
}

export const SlateEditor = ({ story, onChangeStoryField }: Props) => {
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);

  const handleChangeTitle = (title: string) => {
    onChangeStoryField('title', title);
  };

  const handlePublish = () => {
    setShowPublishDialog(true);
  };

  const handleCancelPublish = () => {
    setShowPublishDialog(false);
  };

  const handleConfirmPublish = () => {
    // TODO logic
    setShowPublishDialog(false);
  };

  const handleUnpublish = () => {
    setShowUnpublishDialog(true);
  };

  const handleCancelUnpublish = () => {
    setShowUnpublishDialog(false);
  };

  const handleConfirmUnpublish = () => {
    // TODO logic
    setShowUnpublishDialog(false);
  };

  return (
    <Component
      story={story}
      onChangeTitle={handleChangeTitle}
      onChangeStoryField={onChangeStoryField}
      showPublishDialog={showPublishDialog}
      onPublish={handlePublish}
      onCancelPublish={handleCancelPublish}
      onConfirmPublish={handleConfirmPublish}
      showUnpublishDialog={showUnpublishDialog}
      onUnpublish={handleUnpublish}
      onCancelUnpublish={handleCancelUnpublish}
      onConfirmUnpublish={handleConfirmUnpublish}
    />
  );
};
