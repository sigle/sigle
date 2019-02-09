import React from 'react';
import { useWindowSize } from 'the-platform';
import { SlateEditor as Component } from '../components/SlateEditor';
import { Story } from '../../../types';

interface Props {
  story: Story;
}

export const SlateEditor = ({ story }: Props) => {
  const { width } = useWindowSize();

  return <Component width={width} story={story} />;
};
