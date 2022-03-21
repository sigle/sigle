import React from 'react';
import styled from 'styled-components';
import tw from 'twin.macro';
import { Story } from '../../../types';
import { AppBar } from '../../layout';
import { Container, Text } from '../../../ui';
import { NewEditor } from '../NewEditor';
import { EditorHeader } from '../EditorHeader';

export const FixedContainer = styled.div`
  ${tw`fixed w-full bg-white top-0`};
`;

export const PageContainer = styled(Container)`
  ${tw`mt-24`};
`;

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
