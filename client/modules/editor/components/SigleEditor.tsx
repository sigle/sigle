import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { MdArrowBack } from 'react-icons/md';
import { Link, Container } from '../../../components';
import { SlateEditor } from './SlateEditor';
import { SigleEditorOptions } from './SigleEditorOptions';
import { SigleEditorHeader } from './SigleEditorHeader';
import { SigleEditorTitle } from './SigleEditorTitle';
import { RadiksPrivateStory, RadiksPublicStory } from '../../../types';
import { State } from '../containers/SigleEditor';

const StyledContainer = styled(Container)`
  margin-top: 60px;
  max-width: 768px;
`;

const StyledLink = styled(Link)`
  ${tw`mt-4 mb-8 text-black inline-flex items-center`};
`;

const StyledArrowBack = styled(MdArrowBack)`
  ${tw`mr-2`};
`;

interface Props {
  loading: boolean;
  story?: RadiksPrivateStory | RadiksPublicStory;
  state: State;
  onChangeStoryField: (data: {
    fieldName: 'content' | 'title';
    value: any;
  }) => void;
  optionsOpen: boolean;
  onChangeOptionsOpen: (open: boolean) => void;
  onPublishStory: () => void;
}

export const SigleEditor = ({
  loading,
  story,
  state,
  onChangeStoryField,
  optionsOpen,
  onChangeOptionsOpen,
  onPublishStory,
}: Props) => {
  return (
    <React.Fragment>
      <SigleEditorHeader
        story={story}
        state={state}
        onOpenOptions={() => onChangeOptionsOpen(true)}
        onPublishStory={onPublishStory}
      />
      <StyledContainer>
        <StyledLink href="/me">
          <StyledArrowBack /> Back to my stories
        </StyledLink>
        {/* TODO nice loading */}
        {loading && <div>Loading ...</div>}
        {/* TODO nice 404 */}
        {!loading && !story && <div>Story not found</div>}
        {story && (
          <React.Fragment>
            <SigleEditorTitle
              story={story}
              onChangeStoryField={onChangeStoryField}
            />
            <SlateEditor
              story={story}
              onChangeContent={value => {
                onChangeStoryField({ fieldName: 'content', value });
              }}
            />
            <SigleEditorOptions
              story={story}
              optionsOpen={optionsOpen}
              onChangeOptionsOpen={onChangeOptionsOpen}
            />
          </React.Fragment>
        )}
      </StyledContainer>
    </React.Fragment>
  );
};
