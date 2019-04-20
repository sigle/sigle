import React, { useState } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { Container } from '../components';
import { Header } from '../modules/layout/components/Header';
import { Footer } from '../modules/layout/components/Footer';
import { MeContainer, MeLeft, MeRight } from './Me';
import { SlateEditor } from '../modules/editor/components/SlateEditor';
import { PrivateStory } from '../models';

const EditorTitle = styled.div`
  ${tw`text-2xl font-bold mb-4`};
`;

const Input = styled.input`
  ${tw`outline-none w-full text-xl bg-transparent mb-4`};
`;

interface Props {
  // TODO
  storyAttrs: any;
}

export const Editor = (props: Props) => {
  const [title, setTitle] = useState('');

  const story = new PrivateStory(props.storyAttrs);

  console.log(story, props);

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

Editor.getInitialProps = async ({ query }) => {
  const storyId = query.storyId;
  const story = await PrivateStory.findById(storyId, { decrypt: false });
  // TODO why story is a real object with a wrong id?
  console.log(story);
  return { storyAttrs: story.attrs };
};
