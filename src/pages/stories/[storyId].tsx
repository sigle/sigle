import React from 'react';
import { Protected } from '../../modules/auth/Protected';
import { DashboardLayout } from '../../modules/layout';
import { Editor } from '../../modules/editor';

const EditorPage = () => {
  return (
    <Protected>
      <Editor />
    </Protected>
  );
};

export default EditorPage;
