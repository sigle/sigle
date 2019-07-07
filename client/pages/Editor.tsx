import React from 'react';
import { FullHeightContainer, MinHeightContainer } from '../components';
import { SigleEditor } from '../modules/editor/containers/SigleEditor';

interface Props {
  storyId: string;
  storyType?: 'private';
}

export const Editor = (props: Props) => {
  return (
    <FullHeightContainer>
      <MinHeightContainer>
        <SigleEditor storyId={props.storyId} storyType={props.storyType} />
      </MinHeightContainer>
    </FullHeightContainer>
  );
};

Editor.getInitialProps = ({ query }: any) => {
  const storyId = query.storyId;
  const storyType = query.storyType;
  return { storyId, storyType };
};
