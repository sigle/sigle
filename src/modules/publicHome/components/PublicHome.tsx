import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import * as blockstack from 'blockstack';
import { StoryFile } from '../../../types';
import { Container } from '../../../components';
import { PublicStoryItem } from './PublicStoryItem';

type Props = RouteComponentProps<{ username: string }>;

export const PublicHome = ({ match }: Props) => {
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<StoryFile | null>(null);

  const getUserFile = async () => {
    setLoading(true);
    try {
      let fileUrl = await blockstack.getUserAppFileUrl(
        'publicStories',
        match.params.username,
        window.location.origin
      );
      if (fileUrl) {
        fileUrl = `${fileUrl}.json`;
        const data = await fetch(fileUrl);
        if (data.status === 200) {
          const json = await data.json();
          setFile(json);
        }
      }
      setLoading(false);
    } catch (error) {
      // If blog not found do nothing
      if (error.message === 'Name not found') {
        setLoading(false);
        return;
      }
      console.error(error);
      alert(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserFile();
  }, [false]);

  if (loading) {
    return <Container>Loading ...</Container>;
  }

  if (!file) {
    return <Container>File not found</Container>;
  }

  return (
    <Container>
      {file.stories.map(story => (
        <PublicStoryItem
          key={story.id}
          username={match.params.username}
          story={story}
        />
      ))}
    </Container>
  );
};
