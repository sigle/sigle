import React from 'react';
import { FullHeightContainer, MinHeightContainer } from '../components';
import { SigleEditor } from '../modules/editor/containers/SigleEditor';

interface Props {
  storyId: string;
}

export const Editor = (props: Props) => {
  return (
    <FullHeightContainer>
      <MinHeightContainer>
        <SigleEditor storyId={props.storyId} />
      </MinHeightContainer>
    </FullHeightContainer>
  );
};

Editor.getInitialProps = ({ query }: any) => {
  const storyId = query.storyId;
  return { storyId };
};
