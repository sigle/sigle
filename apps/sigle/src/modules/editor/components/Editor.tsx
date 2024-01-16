import React from 'react';
import { Container } from '@radix-ui/themes';
import { Story } from '../../../types';
import { Text } from '../../../ui';
import { NewEditor } from '../NewEditor';
import { EditorHeader } from '../EditorHeader';
import { EditorFormProvider } from '@/components/editor/editor-form-provider';

interface Props {
  loading: boolean;
  story: Story | null;
}

export const Editor = ({ loading, story }: Props) => {
  if (loading || !story) {
    return (
      <Container size="2">
        <EditorHeader
          story={false}
          loadingSave={false}
          onOpenSettings={() => null}
          onSave={() => null}
          onPublish={() => null}
          onUnpublish={() => null}
        />
        <Text css={{ paddingTop: '$15', textAlign: 'center' }}>
          {loading ? 'Loading ...' : '404 Story not found'}
        </Text>
      </Container>
    );
  }

  return (
    <EditorFormProvider story={story}>
      <NewEditor story={story} />
    </EditorFormProvider>
  );
};
