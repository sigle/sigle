import React from 'react';
import { useWindowSize } from 'the-platform';
import { SlateEditor as Component } from '../components/SlateEditor';
import { Story } from '../../../types';

interface Props {
  story: Story;
  onChangeStoryField: (field: string, value: any) => void;
}

export const SlateEditor = ({ story, onChangeStoryField }: Props) => {
  const { width } = useWindowSize();

  const handleChangeTitle = (title: string) => {
    onChangeStoryField('title', title);
  };

  return (
    <Component
      width={width}
      story={story}
      onChangeTitle={handleChangeTitle}
      onChangeStoryField={onChangeStoryField}
    />
  );
};
