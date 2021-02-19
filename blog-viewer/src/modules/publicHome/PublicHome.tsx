import React from 'react';
import styled from 'styled-components';
import tw from 'twin.macro';
import { StoryFile, SettingsFile } from '../../types';
import { Container } from '../../components';
import { PublicStoryItem } from './PublicStoryItem';

const StyledContainer = styled(Container)`
  ${tw`mt-4 mb-16`};
  max-width: 768px;
`;

const NoStories = styled.p`
  ${tw`mt-8 text-center`};
`;

const Header = styled(Container)`
  ${tw`py-12 flex flex-col items-center`};
`;

const HeaderLogo = styled.img`
  ${tw`mb-4`};
`;

const HeaderName = styled.div`
  ${tw`text-3xl font-bold text-center`};
`;

const HeaderDescription = styled.p`
  ${tw`text-base mt-2 text-center`};
`;

interface PublicHomeProps {
  username: string;
  file: StoryFile;
  settings: SettingsFile;
}

export const PublicHome = ({ username, file, settings }: PublicHomeProps) => {
  // TODO SEO for this page (title etc)
  const siteName = settings.siteName || username;

  const featuredStoryIndex = file.stories.findIndex((story) => story.featured);
  const stories = [...file.stories];
  if (featuredStoryIndex !== -1) {
    stories.splice(featuredStoryIndex, 1);
  }

  return (
    <React.Fragment>
      <Container>
        <Header>
          {settings.siteLogo && (
            <HeaderLogo src={settings.siteLogo} alt={`${siteName} logo`} />
          )}
          <HeaderName>{siteName}</HeaderName>
          {settings.siteDescription &&
            settings.siteDescription
              .split('\n')
              .map((text, index) => (
                <HeaderDescription key={index}>{text}</HeaderDescription>
              ))}
        </Header>
      </Container>

      <StyledContainer>
        {file.stories.length === 0 && <NoStories>No stories yet</NoStories>}
        {featuredStoryIndex !== -1 && (
          <PublicStoryItem
            story={file.stories[featuredStoryIndex]}
            settings={settings}
          />
        )}
        {stories.map((story) => (
          <PublicStoryItem key={story.id} story={story} settings={settings} />
        ))}
      </StyledContainer>
    </React.Fragment>
  );
};
