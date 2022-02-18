import { useRef } from 'react';
import { Story } from '../../types';
import { Container, Text } from '../../ui';
import { Content } from '../publicStory/components/PublicStory';
import { PageContainer } from './components/Editor';
import { EditorHeader } from './EditorHeader';
import { TipTapEditor } from './TipTapEditor';

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
  const editorRef = useRef<{ getEditorHTML: () => string | undefined }>(null);
  const loadingSave = false;
  const handleOpenSettings = () => null;
  // const onChangeTitle = () => null;

  const handleSave = () => {
    const html = editorRef.current?.getEditorHTML();
    if (!html) {
      return;
    }

    console.log({ html });
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
        {/* TODO input */}
        {/* <Input
          value={story.title}
          onChange={(e) => onChangeTitle(e.target.value)}
          placeholder="Title"
        /> */}
        {/* TODO rename component + move to radix */}
        <Content>
          <TipTapEditor ref={editorRef} />
        </Content>
      </PageContainer>
    </Container>
  );
};
