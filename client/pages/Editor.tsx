import React from 'react';
import { NextPage } from 'next';
import { FullHeightContainer, MinHeightContainer } from '../components';
import { SigleEditor } from '../modules/editor/containers/SigleEditor';

interface Props {
  storyId: string;
  storyType?: 'private';
}

export const Editor: NextPage<Props> = props => {
  return (
    <FullHeightContainer>
      <MinHeightContainer>
        <SigleEditor storyId={props.storyId} storyType={props.storyType} />
      </MinHeightContainer>
    </FullHeightContainer>
  );
};

Editor.getInitialProps = async ({ query }) => {
  const { storyId, storyType } = query as {
    storyId: string;
    storyType?: 'private';
  };
  return { storyId, storyType };
};
