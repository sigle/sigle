import React from 'react';
import { PageContainer } from '../modules/editor/components/Editor';
import {
  SlateContainer,
  StyledContent,
} from '../modules/editor/components/SlateEditor';
import { TipTapEditor } from '../modules/editor/TipTapEditor';

const TipTapEditorPage = () => {
  return (
    <PageContainer>
      <SlateContainer>
        <StyledContent>
          <TipTapEditor />
        </StyledContent>
      </SlateContainer>
    </PageContainer>
  );
};

export default TipTapEditorPage;
