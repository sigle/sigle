import React from 'react';
import { Container } from '../components';
import { Header } from '../modules/layout/components/Header';
import { Footer } from '../modules/layout/components/Footer';
import { MeContainer, MeLeft, MeRight } from './Me';
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
          <MeLeft />

          <MeRight>
            <SigleEditor storyId={props.storyId} />
          </MeRight>
        </MeContainer>
      </Container>
      <Footer />
    </React.Fragment>
  );
};

Editor.getInitialProps = ({ query }) => {
  const storyId = query.storyId;
  return { storyId };
};
