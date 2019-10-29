import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import * as blockstack from 'blockstack';
import { toast } from 'react-toastify';
import styled from 'styled-components/macro';
import tw from 'tailwind.macro';
import { StoryFile } from '../../../types';
import { Container } from '../../../components';
import { PublicStoryItem } from './PublicStoryItem';
import { NotFound } from '../../layout/components/NotFound';
import {
  Header,
  HeaderContainer,
  HeaderTitle,
  HeaderLink,
} from '../../publicStory/components/PublicStory';

type Props = RouteComponentProps<{ username: string }>;

const StyledContainer = styled(Container)`
  ${tw`mt-4`};
  max-width: 768px;
`;

const NoStories = styled.p`
  ${tw`mt-8 text-center`};
`;

export const PublicHome = ({ match }: Props) => {
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<StoryFile | null>(null);

  const getUserFile = async () => {
    setLoading(true);
    try {
      const userProfile = await blockstack.lookupProfile(match.params.username);
      const bucketUrl =
        userProfile &&
        userProfile.apps &&
        userProfile.apps[window.location.origin];
      if (bucketUrl) {
        const data = await fetch(`${bucketUrl}publicStories.json`);
        if (data.status === 200) {
          const json = await data.json();
          setFile(json);
        } else if (data.status === 404) {
          // If file is not found we set an empty array to show an empty list
          setFile({ stories: [] });
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
      toast.error(error.message);
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
    return <NotFound error="File not found" />;
  }

  return (
    <React.Fragment>
      <Header>
        <HeaderContainer>
          <HeaderTitle>{match.params.username}</HeaderTitle>
          <HeaderLink to={`/${match.params.username}`}>Stories</HeaderLink>
        </HeaderContainer>
      </Header>
      <StyledContainer>
        {file.stories.length === 0 && <NoStories>No stories yet</NoStories>}
        {file.stories.map(story => (
          <PublicStoryItem
            key={story.id}
            username={match.params.username}
            story={story}
          />
        ))}
      </StyledContainer>
    </React.Fragment>
  );
};
