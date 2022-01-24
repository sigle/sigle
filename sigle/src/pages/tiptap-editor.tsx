import React from 'react';
import { Protected } from '../modules/auth/Protected';
import { PageContainer } from '../modules/editor/components/Editor';
import {
  SlateContainer,
  StyledContent,
} from '../modules/editor/components/SlateEditor';
import { TipTapEditor } from '../modules/editor/TipTapEditor';

const TipTapEditorPage = () => {
  return (
    <Protected>
      <PageContainer>
        <SlateContainer>
          <StyledContent>
            <TipTapEditor />
          </StyledContent>
        </SlateContainer>
      </PageContainer>
    </Protected>
  );
};

export default TipTapEditorPage;
