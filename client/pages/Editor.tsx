import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { MdArrowBack } from 'react-icons/md';
import { Container, Link } from '../components';
import { Header } from '../modules/layout/components/Header';
import { Footer } from '../modules/layout/components/Footer';
import { SigleEditor } from '../modules/editor/containers/SigleEditor';

const StyledLink = styled(Link)`
  ${tw`mt-4 mb-4 text-black inline-flex items-center`};
`;

const StyledArrowBack = styled(MdArrowBack)`
  ${tw`mr-2`};
`;

interface Props {
  storyId: string;
}

export const Editor = (props: Props) => {
  return (
    <React.Fragment>
      <Header />
      <Container>
        <StyledLink href="/me">
          <StyledArrowBack /> Back to my stories
        </StyledLink>
        <SigleEditor storyId={props.storyId} />
      </Container>
      <Footer />
    </React.Fragment>
  );
};

Editor.getInitialProps = ({ query }: any) => {
  const storyId = query.storyId;
  return { storyId };
};
