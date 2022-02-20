import { Editor } from '@tiptap/react';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { styled } from '../../stitches.config';
import { Story } from '../../types';
import { Container, Text } from '../../ui';
import { Content } from '../publicStory/components/PublicStory';
import { PageContainer } from './components/Editor';
import { EditorHeader } from './EditorHeader';
import { TipTapEditor } from './TipTapEditor';
import { createSubsetStory, saveStory } from './utils';

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
  onPublish: () => void;
  onUnpublish: () => void;
}

// TODO check security handled by TipTap when loading HTML (read only mode)
// Is it enough or do we need another lib to sanitize the HTML first?

export const NewEditor = ({
  story,
  onPublish,
  onUnpublish,
}: NewEditorProps) => {
  const editorRef = useRef<{ getEditor: () => Editor | null }>(null);
  const [loadingSave, setLoadingSave] = useState(false);
  const [newStory, setNewStory] = useState(story);

  const handleOpenSettings = () => null;
  // const onChangeTitle = () => null;

  const handleSave = async () => {
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
      saveStory(updatedStory, subsetStory);
      setNewStory(updatedStory);
      // Success toast
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
        story={story}
        loadingSave={loadingSave}
        onOpenSettings={handleOpenSettings}
        onSave={handleSave}
        onPublish={onPublish}
        onUnpublish={onUnpublish}
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
            {/* TODO input */}
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
    </Container>
  );
};
