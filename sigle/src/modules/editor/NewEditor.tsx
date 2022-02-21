import { Editor } from '@tiptap/react';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import NProgress from 'nprogress';
import * as Fathom from 'fathom-client';
import posthog from 'posthog-js';
import { styled } from '../../stitches.config';
import { Story } from '../../types';
import { Container, Text } from '../../ui';
import { Content } from '../publicStory/components/PublicStory';
import { PageContainer } from './components/Editor';
import { EditorHeader } from './EditorHeader';
import { PublishDialog } from './PublishDialog';
import { TipTapEditor } from './TipTapEditor';
import { createSubsetStory, saveStory } from './utils';
import { publishStory, unPublishStory } from '../../utils';
import { Goals } from '../../utils/fathom';
import { UnpublishDialog } from './UnpublishDialog';
import { PublishedDialog } from './PublishedDialog';

const TitleInput = styled('input', {
  outline: 'transparent',
  width: '100%',
  // Style as h1
  fontSize: '$7',
  letterSpacing: '-0.3px',
  fontWeight: 'bold',
});

interface NewEditorProps {
  story: Story;
}

// TODO check security handled by TipTap when loading HTML (read only mode)
// Is it enough or do we need another lib to sanitize the HTML first?

export const NewEditor = ({ story }: NewEditorProps) => {
  const editorRef = useRef<{ getEditor: () => Editor | null }>(null);
  const [loadingSave, setLoadingSave] = useState(false);
  const [newStory, setNewStory] = useState(story);
  const [publishDialogState, setPublishDialogState] = useState({
    open: false,
    loading: false,
  });
  //  TODO
  const [showPublishedDialog, setShowPublishedDialog] = useState(false);
  const [unpublishDialogState, setUnpublishDialogState] = useState({
    open: false,
    loading: false,
  });

  // TODO link settings
  const handleOpenSettings = () => null;

  const handlePublish = () => {
    setPublishDialogState({
      open: true,
      loading: false,
    });
  };

  const handleCancelPublish = () => {
    setPublishDialogState({
      open: false,
      loading: false,
    });
  };

  const handleConfirmPublish = async () => {
    setPublishDialogState({
      open: true,
      loading: true,
    });
    NProgress.start();
    try {
      await handleSave({ hideToast: true });
      await publishStory(story.id);
      setNewStory({ ...newStory, type: 'public' });
      setShowPublishedDialog(true);
      Fathom.trackGoal(Goals.PUBLISH, 0);
      posthog.capture('publish-story', { id: story.id });
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
    NProgress.done();
    setPublishDialogState({
      open: false,
      loading: false,
    });
  };

  const handleCancelPublished = () => {
    setShowPublishedDialog(false);
  };

  const handleUnpublish = () => {
    setUnpublishDialogState({
      open: true,
      loading: false,
    });
  };

  const handleCancelUnpublish = () => {
    setUnpublishDialogState({
      open: false,
      loading: false,
    });
  };

  const handleConfirmUnpublish = async () => {
    setUnpublishDialogState({
      open: true,
      loading: true,
    });
    NProgress.start();
    try {
      await unPublishStory(story.id);
      setNewStory({ ...newStory, type: 'private' });
      toast.success('Story unpublished');
      posthog.capture('unpublish-story', { id: story.id });
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
    NProgress.done();
    setUnpublishDialogState({
      open: false,
      loading: false,
    });
  };

  const handleSave = async ({ hideToast }: { hideToast?: boolean } = {}) => {
    const editor = editorRef.current?.getEditor();
    if (!editor) {
      return;
    }

    setLoadingSave(true);
    try {
      const html = editor.getHTML();
      const updatedStory: Story = {
        ...newStory,
        content: html,
        contentVersion: '2',
        updatedAt: Date.now(),
      };
      const subsetStory = createSubsetStory(updatedStory, {
        plainContent: editor.getText(),
      });
      await saveStory(updatedStory, subsetStory);
      setNewStory(updatedStory);
      if (!hideToast) {
        toast.success('Story saved');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
    setLoadingSave(false);
  };

  // Editing an old story with the new editor is not allowed for now
  // We allow empty stories to pass the check and use the new editor
  const isOldStory =
    !story.contentVersion && story.content?.document.nodes.length > 1;

  return (
    <Container
      css={{
        pt: '$5',
        '@md': {
          pt: '$10',
        },
      }}
    >
      <EditorHeader
        story={newStory}
        loadingSave={loadingSave}
        onOpenSettings={handleOpenSettings}
        onSave={handleSave}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
      />

      <Text size="sm" color="orange">
        ⚠️ You are using the experimental editor, expect things to break
      </Text>

      <PageContainer>
        {isOldStory ? (
          <Text size="sm" color="orange">
            ⚠️ The experimental editor can't be used on old stories for now
          </Text>
        ) : (
          <>
            <TitleInput
              value={newStory.title}
              onChange={(e) => {
                setNewStory({ ...newStory, title: e.target.value });
              }}
              placeholder="Title"
            />
            {/* TODO rename component + move to radix */}
            <Content>
              <TipTapEditor ref={editorRef} story={story} />
            </Content>
          </>
        )}
      </PageContainer>

      <PublishDialog
        story={newStory}
        open={publishDialogState.open}
        loading={publishDialogState.loading}
        onConfirm={handleConfirmPublish}
        onClose={handleCancelPublish}
        // TODO onEditPreview
        onEditPreview={() => null}
      />

      <PublishedDialog
        open={showPublishedDialog}
        onOpenChange={handleCancelPublished}
        story={story}
      />

      <UnpublishDialog
        open={unpublishDialogState.open}
        loading={unpublishDialogState.loading}
        onConfirm={handleConfirmUnpublish}
        onClose={handleCancelUnpublish}
      />
    </Container>
  );
};
