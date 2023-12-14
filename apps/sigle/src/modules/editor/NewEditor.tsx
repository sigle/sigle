import { Editor } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import NProgress from 'nprogress';
import * as Fathom from 'fathom-client';
import posthog from 'posthog-js';
import {
  fetchStoriesControllerPublish,
  fetchStoriesControllerUnpublish,
} from '@/__generated__/sigle-api';
import { styled } from '../../stitches.config';
import { Story } from '../../types';
import { Container } from '../../ui';
import { publishStory, unPublishStory } from '../../utils';
import { Goals } from '../../utils/fathom';
import { useAuth } from '../auth/AuthContext';
import { EditorHeader } from './EditorHeader';
import { PublishDialog } from './PublishDialog';
import { TipTapEditor } from './TipTapEditor';
import { createSubsetStory, saveStory } from './utils';
import { UnpublishDialog } from './UnpublishDialog';
import { PublishedDialog } from './PublishedDialog';
import { CoverImage } from './CoverImage';
import { EditorSettings } from './EditorSettings/EditorSettings';

const TitleInput = styled('input', {
  outline: 'transparent',
  background: 'transparent',
  width: '100%',
  fontWeight: '700',
  fontSize: '36px',
  lineHeight: '46px',
  letterSpacing: '-0.3px',
  '&::placeholder': {
    color: '$gray9',
  },
});

const EditorContainer = styled('div', {
  margin: '0 auto',
  paddingTop: '$15',
  paddingBottom: '$15',
});

interface NewEditorProps {
  story: Story;
}

export const NewEditor = ({ story }: NewEditorProps) => {
  const router = useRouter();
  const { isLegacy } = useAuth();
  const editorRef = useRef<{ getEditor: () => Editor | null }>(null);
  const [loadingSave, setLoadingSave] = useState(false);
  const [newStory, setNewStory] = useState(story);
  const [publishDialogState, setPublishDialogState] = useState({
    open: false,
    loading: false,
  });
  const [showPublishedDialog, setShowPublishedDialog] = useState(false);
  const [unpublishDialogState, setUnpublishDialogState] = useState({
    open: false,
    loading: false,
  });
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  // prompt the user if they try and leave with unsaved changes
  useEffect(() => {
    const warningText =
      'You have unsaved changes - are you sure you wish to leave this page?';

    // Compare existing HTML to saved HTML to determine whether there are unsaved changes
    const isEditorContentUnsaved = () => {
      const editor = editorRef.current?.getEditor();
      const storyHTML = editor?.getHTML();
      return storyHTML !== newStory.content;
    };

    const handleWindowClose = (e: BeforeUnloadEvent) => {
      if (!isEditorContentUnsaved()) {
        return;
      }
      e.preventDefault();
      return (e.returnValue = warningText);
    };

    const handleBrowseAway = () => {
      if (!isEditorContentUnsaved()) {
        return;
      }

      if (window.confirm(warningText)) return;
      router.events.emit('routeChangeError');
      throw 'routeChange aborted.';
    };

    window.addEventListener('beforeunload', handleWindowClose);
    router.events.on('routeChangeStart', handleBrowseAway);
    return () => {
      window.removeEventListener('beforeunload', handleWindowClose);
      router.events.off('routeChangeStart', handleBrowseAway);
    };
  }, [newStory]);

  const handleOpenSettings = () => setShowSettingsDialog(true);
  const handleCloseSettings = () => setShowSettingsDialog(false);

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

  const handleConfirmPublish = async (options?: { send?: boolean }) => {
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
      if (!isLegacy) {
        await fetchStoriesControllerPublish({
          body: { id: story.id, send: options?.send ?? false },
        });
      }
    } catch (error) {
      console.error(error.message);
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
      if (!isLegacy) {
        await fetchStoriesControllerUnpublish({
          body: { id: story.id },
        });
      }
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

  const handleSave = async ({
    hideToast,
    toastPosition,
    story,
  }: {
    story?: Story;
    hideToast?: boolean;
    toastPosition?: 'top-left';
  } = {}) => {
    const editor = editorRef.current?.getEditor();
    if (!editor) {
      return;
    }

    setLoadingSave(true);
    try {
      const html = editor.getHTML();
      const updatedStory: Story = {
        ...(story ? story : newStory),
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
        toast.success('Story saved', { position: toastPosition });
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
    setLoadingSave(false);
  };

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

      <EditorContainer className="prose dark:prose-invert lg:prose-lg">
        <TitleInput
          value={newStory.title}
          onChange={(e) => {
            setNewStory({ ...newStory, title: e.target.value });
          }}
          placeholder="Title"
        />
        <CoverImage story={newStory} setStoryFile={setNewStory} />

        <TipTapEditor ref={editorRef} story={story} />
      </EditorContainer>

      <PublishDialog
        story={newStory}
        open={publishDialogState.open}
        loading={publishDialogState.loading}
        onConfirm={handleConfirmPublish}
        onClose={handleCancelPublish}
        onEditPreview={handleOpenSettings}
      />

      <PublishedDialog
        open={showPublishedDialog}
        onOpenChange={handleCancelPublished}
        story={newStory}
      />

      <UnpublishDialog
        open={unpublishDialogState.open}
        loading={unpublishDialogState.loading}
        onConfirm={handleConfirmUnpublish}
        onClose={handleCancelUnpublish}
      />

      <EditorSettings
        story={newStory}
        open={showSettingsDialog}
        onClose={handleCloseSettings}
        setStoryFile={setNewStory}
        onSave={handleSave}
      />
    </Container>
  );
};
