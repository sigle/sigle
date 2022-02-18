import { Story } from '../../types';
import { Container } from '../../ui';
import { Content } from '../publicStory/components/PublicStory';
import { PageContainer } from './components/Editor';
import { EditorHeader } from './EditorHeader';
import { TipTapEditor } from './TipTapEditor';

interface NewEditorProps {
  story: Story;
  onPublish: () => void;
  onUnpublish: () => void;
}

export const NewEditor = ({
  story,
  onPublish,
  onUnpublish,
}: NewEditorProps) => {
  const loadingSave = false;
  const handleSave = () => null;
  const handleOpenSettings = () => null;
  const onChangeTitle = () => null;

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

      <PageContainer>
        {/* TODO input */}
        {/* <Input
          value={story.title}
          onChange={(e) => onChangeTitle(e.target.value)}
          placeholder="Title"
        /> */}
        {/* TODO rename component + move to radix */}
        <Content>
          <TipTapEditor />
        </Content>
      </PageContainer>
    </Container>
  );
};
