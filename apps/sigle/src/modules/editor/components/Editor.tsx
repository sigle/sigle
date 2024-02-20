import React from 'react';
import { Container, Flex, Text } from '@radix-ui/themes';
import { EditorFormProvider } from '@/components/editor/editor-form-provider';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Story } from '../../../types';
import { NewEditor } from '../NewEditor';

interface Props {
  loading: boolean;
  story: Story | null;
}

export const Editor = ({ loading, story }: Props) => {
  if (loading) {
    return (
      <Container size="2">
        <Flex justify="center" py="7">
          <LoadingSpinner />
        </Flex>
      </Container>
    );
  }
  if (!story) {
    return (
      <Container size="2">
        <Flex justify="center" py="7">
          <Text color="red">404 story not found</Text>
        </Flex>
      </Container>
    );
  }

  return (
    <EditorFormProvider story={story}>
      <NewEditor story={story} />
    </EditorFormProvider>
  );
};
