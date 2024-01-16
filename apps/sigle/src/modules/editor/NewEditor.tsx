import { Editor } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import NProgress from 'nprogress';
import * as Fathom from 'fathom-client';
import posthog from 'posthog-js';
import { Container } from '@radix-ui/themes';
import { useFormContext } from 'react-hook-form';
import {
  fetchStoriesControllerPublish,
  fetchStoriesControllerUnpublish,
} from '@/__generated__/sigle-api';
import { EditorTitle } from '@/components/editor/editor-title';
import {
  EditorFormProvider,
  EditorPostFormData,
} from '@/components/editor/editor-form-provider';
import { EditorHeader } from '@/components/editor/editor-header';
import { EditorSettings } from '@/components/editor/settings/editor-settings';
import { EditorTipTap } from '@/components/editor/editor-tiptap';
import { useEditorStore } from '@/components/editor/store';
import { EditorCoverImage } from '@/components/editor/editor-cover-image';
import { Story } from '../../types';
import { publishStory, unPublishStory } from '../../utils';
import { Goals } from '../../utils/fathom';
import { PublishDialog } from './PublishDialog';
import { createSubsetStory, saveStory } from './utils';
import { UnpublishDialog } from './UnpublishDialog';
import { PublishedDialog } from './PublishedDialog';

interface NewEditorProps {
  story: Story;
}

export const NewEditor = ({ story }: NewEditorProps) => {
  const router = useRouter();
  const { getValues } = useFormContext<EditorPostFormData>();
  const setSaving = useEditorStore((state) => state.setSaving);
  const editor = useEditorStore((state) => state.editor);
  // const [newStory, setNewStory] = useState(story);
  const [publishDialogState, setPublishDialogState] = useState({
    open: false,
    loading: false,
  });
  const [showPublishedDialog, setShowPublishedDialog] = useState(false);
  const [unpublishDialogState, setUnpublishDialogState] = useState({
    open: false,
    loading: false,
  });

  // prompt the user if they try and leave with unsaved changes
  // useEffect(() => {
  //   const warningText =
  //     'You have unsaved changes - are you sure you wish to leave this page?';

  //   // Compare existing HTML to saved HTML to determine whether there are unsaved changes
  //   const isEditorContentUnsaved = () => {
  //     const storyHTML = editor?.getHTML();
  //     return storyHTML !== getValues('content');
  //   };

  //   const handleWindowClose = (e: BeforeUnloadEvent) => {
  //     if (!isEditorContentUnsaved()) {
  //       return;
  //     }
  //     e.preventDefault();
  //     return (e.returnValue = warningText);
  //   };

  //   const handleBrowseAway = () => {
  //     if (!isEditorContentUnsaved()) {
  //       return;
  //     }

  //     if (window.confirm(warningText)) return;
  //     router.events.emit('routeChangeError');
  //     throw 'routeChange aborted.';
  //   };

  //   window.addEventListener('beforeunload', handleWindowClose);
  //   router.events.on('routeChangeStart', handleBrowseAway);
  //   return () => {
  //     window.removeEventListener('beforeunload', handleWindowClose);
  //     router.events.off('routeChangeStart', handleBrowseAway);
  //   };
  // }, [newStory]);

  // const handlePublish = () => {
  //   setPublishDialogState({
  //     open: true,
  //     loading: false,
  //   });
  // };

  // const handleCancelPublish = () => {
  //   setPublishDialogState({
  //     open: false,
  //     loading: false,
  //   });
  // };

  // const handleConfirmPublish = async (options?: { send?: boolean }) => {
  //   setPublishDialogState({
  //     open: true,
  //     loading: true,
  //   });
  //   NProgress.start();
  //   try {
  //     await handleSave({ hideToast: true });
  //     await publishStory(story.id);
  //     setNewStory({ ...newStory, type: 'public' });
  //     setShowPublishedDialog(true);
  //     Fathom.trackGoal(Goals.PUBLISH, 0);
  //     posthog.capture('publish-story', { id: story.id });
  //     await fetchStoriesControllerPublish({
  //       body: { id: story.id, send: options?.send ?? false },
  //     });
  //   } catch (error) {
  //     console.error(error.message);
  //     toast.error(error.message);
  //   }
  //   NProgress.done();
  //   setPublishDialogState({
  //     open: false,
  //     loading: false,
  //   });
  // };

  // const handleCancelPublished = () => {
  //   setShowPublishedDialog(false);
  // };

  // const handleUnpublish = () => {
  //   setUnpublishDialogState({
  //     open: true,
  //     loading: false,
  //   });
  // };

  // const handleCancelUnpublish = () => {
  //   setUnpublishDialogState({
  //     open: false,
  //     loading: false,
  //   });
  // };

  // const handleConfirmUnpublish = async () => {
  //   setUnpublishDialogState({
  //     open: true,
  //     loading: true,
  //   });
  //   NProgress.start();
  //   try {
  //     await unPublishStory(story.id);
  //     setNewStory({ ...newStory, type: 'private' });
  //     toast.success('Story unpublished');
  //     posthog.capture('unpublish-story', { id: story.id });
  //     await fetchStoriesControllerUnpublish({
  //       body: { id: story.id },
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     toast.error(error.message);
  //   }
  //   NProgress.done();
  //   setUnpublishDialogState({
  //     open: false,
  //     loading: false,
  //   });
  // };

  const handleSave = async ({
    hideToast,
    toastPosition,
    story: storyParams,
  }: {
    story?: Story;
    hideToast?: boolean;
    toastPosition?: 'top-left';
  } = {}) => {
    if (!editor) return;

    setSaving(true);
    try {
      const htmlContent = editor.getHTML();
      const values = getValues();
      // TODO test edge cases for this
      const updatedStory: Story = {
        // Take the initial object
        ...(storyParams ? storyParams : story),
        // Update with form values
        ...values,
        createdAt: new Date(values.createdAt).getTime(),
        content: htmlContent,
        contentVersion: '2',
        updatedAt: Date.now(),
      };
      const subsetStory = createSubsetStory(updatedStory, {
        plainContent: editor.getText(),
      });
      await saveStory(updatedStory, subsetStory);
      if (!hideToast) {
        toast.success('Story saved', { position: toastPosition });
      }
      posthog.capture('save-story', { id: story.id });
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
    setSaving(false);
  };

  return (
    <>
      <EditorHeader onSave={handleSave} />
      <Container size="2">
        <div className="prose my-10 dark:prose-invert lg:prose-lg">
          <EditorTitle />
          <EditorCoverImage story={story} />
          <EditorTipTap />
        </div>

        <EditorSettings />

        {/* <PublishDialog
          story={newStory}
          open={publishDialogState.open}
          loading={publishDialogState.loading}
          onConfirm={handleConfirmPublish}
          onClose={handleCancelPublish}
          // onEditPreview={handleOpenSettings}
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
        /> */}
      </Container>
    </>
  );
};
