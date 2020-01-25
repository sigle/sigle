import React from 'react';
import { Protected } from '../../modules/auth/Protected';
import { DashboardLayout } from '../../modules/layout';
import { Editor } from '../../modules/editor';

const EditorPage = () => {
  return (
    <Protected>
      <DashboardLayout>
        <Editor />
      </DashboardLayout>
    </Protected>
  );
};

export default EditorPage;
