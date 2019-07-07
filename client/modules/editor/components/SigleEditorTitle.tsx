import React, { useState } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';

const Input = styled.input`
  ${tw`outline-none w-full text-2xl font-bold bg-transparent mb-8`};
`;

interface Props {
  story: { attrs: { title: string } };
  onChangeStoryField: any;
}

export const SigleEditorTitle = ({ story, onChangeStoryField }: Props) => {
  const [title, setTitle] = useState(story.attrs.title);

  return (
    <Input
      value={title}
      onChange={e => {
        setTitle(e.target.value);
        onChangeStoryField({ fieldName: 'title', value: e.target.value });
      }}
      placeholder="Title"
    />
  );
};
