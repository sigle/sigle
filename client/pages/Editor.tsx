import React from 'react';
import { Container } from '../components';
import { Header } from '../modules/layout/components/Header';
import { Footer } from '../modules/layout/components/Footer';
import { Me as MeContainer } from '../modules/layout/components/Me';
import { SigleEditor } from '../modules/editor/containers/SigleEditor';

interface Props {
  storyId: string;
}

export const Editor = (props: Props) => {
  return (
    <React.Fragment>
      <Header />
      <Container>
        <MeContainer>
          <SigleEditor storyId={props.storyId} />
        </MeContainer>
      </Container>
      <Footer />
    </React.Fragment>
  );
};

Editor.getInitialProps = ({ query }: any) => {
  const storyId = query.storyId;
  return { storyId };
};
