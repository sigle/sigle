import React from 'react';
import { Protected } from '../../modules/auth/Protected';
import { LoggedIn } from '../../modules/layout';
import { Editor } from '../../modules/editor';

const EditorPage = () => {
  return (
    <Protected>
      <LoggedIn showAppBar={false}>
        <Editor />
      </LoggedIn>
    </Protected>
  );
};

export default EditorPage;
