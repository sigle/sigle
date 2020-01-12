import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { StoryItem as Component } from '../components/StoryItem';
import { SubsetStory, BlockstackUser } from '../../../types';
import { publishStory, unPublishStory } from '../../../utils';

interface Props {
  user: BlockstackUser;
  story: SubsetStory;
  type: 'public' | 'private';
}

export const StoryItem = ({ user, story, type }: Props) => {
  return <Component user={user} story={story} type={type} />;
};
