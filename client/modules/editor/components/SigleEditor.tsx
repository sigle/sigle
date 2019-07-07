import React, { useState } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { MdArrowBack } from 'react-icons/md';
import { Link, Container } from '../../../components';
import { SlateEditor } from './SlateEditor';
import { SigleEditorOptions } from './SigleEditorOptions';
import { SigleEditorHeader } from './SigleEditorHeader';

const StyledContainer = styled(Container)`
  margin-top: 60px;
`;

const StyledLink = styled(Link)`
  ${tw`mt-4 mb-4 text-black inline-flex items-center`};
`;

const StyledArrowBack = styled(MdArrowBack)`
  ${tw`mr-2`};
`;

const Input = styled.input`
  ${tw`outline-none w-full text-2xl font-bold bg-transparent mb-8`};
`;

interface Props {
  story: any;
  state: any;
  onChangeTitle: any;
  onChangeContent: any;
  optionsOpen: boolean;
  onChangeOptionsOpen: (open: boolean) => void;
}

export const SigleEditor = ({
  story,
  state,
  onChangeTitle,
  onChangeContent,
  optionsOpen,
  onChangeOptionsOpen,
}: Props) => {
  console.log(story);
  const [title, setTitle] = useState(story.attrs.title);

  return (
    <React.Fragment>
      <SigleEditorHeader
        state={state}
        onOpenOptions={() => onChangeOptionsOpen(true)}
      />
      <StyledContainer>
        <StyledLink href="/me">
          <StyledArrowBack /> Back to my stories
        </StyledLink>
        <Input
          value={title}
          onChange={e => {
            setTitle(e.target.value);
            onChangeTitle(e.target.value);
          }}
          placeholder="Title"
        />
        <SlateEditor story={story} onChangeContent={onChangeContent} />
        <SigleEditorOptions
          story={story}
          optionsOpen={optionsOpen}
          onChangeOptionsOpen={onChangeOptionsOpen}
        />
      </StyledContainer>
    </React.Fragment>
  );
};
