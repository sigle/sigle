import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Protected } from '../modules/auth/Protected';
import { Home } from '../modules/home';
import {
  enableExperimentalEditor,
  isExperimentalEditorEnabled,
} from '../modules/editor/utils/experimentalEditor';

const HomePage = () => {
  const router = useRouter();
  const isExperimentalEditor = router.query.experimentalEditor === 'true';

  console.log({ isExperimentalEditorEnabled });

  useEffect(() => {
    if (isExperimentalEditor && !isExperimentalEditorEnabled) {
      enableExperimentalEditor();
    }
  }, [isExperimentalEditor]);

  return (
    <Protected>
      <Home type="drafts" />
    </Protected>
  );
};

export default HomePage;
