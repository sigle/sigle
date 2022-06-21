import React from 'react';
import { render } from '@testing-library/react';
import { PublicStoryItem } from './PublicStoryItem';
import { SubsetStory } from '../../../types';

const username = 'sigleapp.id.blockstack';
const story: SubsetStory = {
  id: 'Qk5y5A0yvSXOwIbB6SlMc',
  title: 'Introducing Meta Data',
  content:
    'We heard you… writing stories is cool, but having the opportunity to share your writings with your community is even cooler.↵That’s why we worked on meta data, allowing you to get fancy share boxes on social media and having the possibility of adding your own meta title and description.↵From today, ...',
  type: 'public',
  createdAt: 1572998400000,
  updatedAt: 1573580912255,
};
const settings = {};

describe('PublicStoryItem', () => {
  it('should display the subset story', async () => {
    const { getByTestId } = render(
      <PublicStoryItem username={username} story={story} settings={settings} />
    );

    expect(getByTestId('story-title')).toHaveTextContent(story.title);
    expect(getByTestId('story-date')).toHaveTextContent(
      'November 06, 2019 at 12:00am'
    );
    expect(getByTestId('story-content')).toHaveTextContent(story.content);
  });

  it('should display cover image', async () => {
    const { getByTestId } = render(
      <PublicStoryItem
        username={username}
        story={{ ...story, coverImage: 'https://i.goopics.net/9OW4l.jpg' }}
        settings={settings}
      />
    );

    expect(getByTestId('story-cover-image')).toBeTruthy();
  });
});
