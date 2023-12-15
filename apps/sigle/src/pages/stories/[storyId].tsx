import React from 'react';
import { Protected } from '../../components/authentication/protected';
import { Editor } from '../../modules/editor';

const EditorPage = () => {
  return (
    <Protected>
      <Editor />
    </Protected>
  );
};

export default EditorPage;
