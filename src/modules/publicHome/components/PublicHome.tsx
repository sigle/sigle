import React from 'react';
import styled from 'styled-components';
import tw from 'twin.macro';
import { useRouter } from 'next/router';
import { StoryFile, SettingsFile } from '../../../types';
import { Container } from '../../../components';
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
  ${tw`text-3xl font-bold`};
`;

const HeaderDescription = styled.div`
  ${tw`text-base mt-2`};
`;

interface PublicHomeProps {
  file: StoryFile;
  settings: SettingsFile;
}

export const PublicHome = ({ file, settings }: PublicHomeProps) => {
  const router = useRouter();
  const { username } = router.query as { username: string };

  const siteName = settings.siteName || username;

  return (
    <React.Fragment>
      <Container>
        <Header>
          {settings.siteLogo && (
            <HeaderLogo src={settings.siteLogo} alt={`${siteName} logo`} />
          )}
          <HeaderName>{siteName}</HeaderName>
          {settings.siteDescription && (
            <HeaderDescription>{settings.siteDescription}</HeaderDescription>
          )}
        </Header>
      </Container>

      <StyledContainer>
        {file.stories.length === 0 && <NoStories>No stories yet</NoStories>}
        {file.stories.map(story => (
          <PublicStoryItem
            key={story.id}
            username={username}
            story={story}
            settings={settings}
          />
        ))}
      </StyledContainer>
    </React.Fragment>
  );
};
