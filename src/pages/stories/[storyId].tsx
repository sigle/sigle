import React from 'react';
import { Protected } from '../../modules/auth/Protected';
import { LoggedIn } from '../../modules/layout/components/LoggedIn';
import { Editor } from '../../modules/editor';

const EditorPage = () => {
  return (
    <Protected>
      <LoggedIn>
        <Editor />
      </LoggedIn>
    </Protected>
  );
};

export default EditorPage;
