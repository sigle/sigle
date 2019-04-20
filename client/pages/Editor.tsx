import React, { useState } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { Container } from '../components';
import { Header } from '../modules/layout/components/Header';
import { Footer } from '../modules/layout/components/Footer';
import { MeContainer, MeLeft, MeRight } from './Me';
import { SlateEditor } from '../modules/editor/components/SlateEditor';

const EditorTitle = styled.div`
  ${tw`text-3xl font-bold mb-4`};
`;

const Input = styled.input`
  ${tw`outline-none w-full text-2xl bg-transparent mb-4`};
`;

export const Editor = () => {
  const [title, setTitle] = useState('');

  return (
    <React.Fragment>
      <Header />
      <Container>
        <MeContainer>
          <MeLeft />

          <MeRight>
            <EditorTitle>Editor</EditorTitle>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title"
            />
            <SlateEditor />
          </MeRight>
        </MeContainer>
      </Container>
      <Footer />
    </React.Fragment>
  );
};
