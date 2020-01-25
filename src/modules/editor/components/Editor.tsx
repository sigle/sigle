import React from 'react';
import { Story } from '../../../types';
import { SlateEditor } from '../containers/SlateEditor';

interface Props {
  loading: boolean;
  story: Story | null;
  onChangeStoryField: (field: string, value: any) => void;
}

export const Editor = ({ loading, story, onChangeStoryField }: Props) => {
  // TODO nice loading
  if (loading) {
    return <p>Loading ...</p>;
  }

  // TODO nice 404
  if (!story) {
    return <p>404 Story not found</p>;
  }

  return <SlateEditor story={story} onChangeStoryField={onChangeStoryField} />;
};
