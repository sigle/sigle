import React, { useState } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { SlateEditor } from './SlateEditor';

const EditorTitle = styled.div`
  ${tw`text-2xl font-bold mb-4`};
`;

const Input = styled.input`
  ${tw`outline-none w-full text-xl bg-transparent mb-4`};
`;

interface Props {
  story: any;
  state: any;
  onChangeTitle: any;
  onChangeContent: any;
}

export const SigleEditor = ({
  story,
  state,
  onChangeTitle,
  onChangeContent,
}: Props) => {
  console.log(story);
  const [title, setTitle] = useState(story.attrs.title);

  return (
    <React.Fragment>
      <EditorTitle>Editor</EditorTitle>
      <Input
        value={title}
        onChange={e => {
          setTitle(e.target.value);
          onChangeTitle(e.target.value);
        }}
        placeholder="Title"
      />
      <SlateEditor
        story={story}
        state={state}
        onChangeContent={onChangeContent}
      />
    </React.Fragment>
  );
};
