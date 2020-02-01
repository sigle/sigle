import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { Story } from '../../../types';
import { SlateEditor } from '../containers/SlateEditor';
import { AppBar } from '../../layout';
import { Container } from '../../../components';

export const FixedContainer = styled.div`
  ${tw`fixed w-full bg-white top-0`};
`;

export const PageContainer = styled(Container)`
  ${tw`mt-24`};
`;

interface Props {
  loading: boolean;
  story: Story | null;
  onChangeStoryField: (field: string, value: any) => void;
}

export const Editor = ({ loading, story, onChangeStoryField }: Props) => {
  // TODO nice loading
  if (loading) {
    return (
      <React.Fragment>
        <FixedContainer>
          <AppBar />
        </FixedContainer>
        <PageContainer>
          <p>Loading ...</p>
        </PageContainer>
      </React.Fragment>
    );
  }

  // TODO nice 404
  if (!story) {
    return (
      <React.Fragment>
        <FixedContainer>
          <AppBar />
        </FixedContainer>
        <PageContainer>
          <p>404 Story not found</p>
        </PageContainer>
      </React.Fragment>
    );
  }

  return <SlateEditor story={story} onChangeStoryField={onChangeStoryField} />;
};
