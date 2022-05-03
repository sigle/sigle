import React from 'react';
import { Story } from '../../../types';
import { Container, Text } from '../../../ui';
import { NewEditor } from '../NewEditor';
import { EditorHeader } from '../EditorHeader';

interface Props {
  loading: boolean;
  story: Story | null;
}

export const Editor = ({ loading, story }: Props) => {
  if (loading || !story) {
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

  return <NewEditor story={story} />;
};
