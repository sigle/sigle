import React from 'react';
import styled from 'styled-components';
import tw from 'twin.macro';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { StoryFile, SettingsFile } from '../../../types';
import { Container } from '../../../components';
import { PublicStoryItem } from './PublicStoryItem';
import { PoweredBy } from '../../publicStory/PoweredBy';
import { AppHeader } from '../../layout/components/AppHeader';
import { Box, Flex, Text } from '../../../ui';
import { sigleConfig } from '../../../config';

const StyledContainer = styled(Container)`
  ${tw`pt-4 pb-16`};
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

const PublicHomeSiteUrl = ({ siteUrl }: { siteUrl: string }) => {
  let displayUrl = siteUrl;
  let fullUrl = siteUrl;
  if (siteUrl.startsWith('http://') || siteUrl.startsWith('https://')) {
    // We strip http | https from the string for better display
    displayUrl = siteUrl.replace(/^https?:\/\//, '');
  } else {
    // We prefix with https:// to make sure it's a valid URL
    fullUrl = `https://${siteUrl}`;
  }

  return (
    <Text
      css={{
        color: '$gray9',

        '&:hover': {
          color: '$gray10',
        },
        '&:active': {
          color: '$gray12',
        },
      }}
      size="sm"
      as="a"
      href={fullUrl}
      target="_blank"
      rel="noreferrer"
    >
      {displayUrl}
    </Text>
  );
};

interface PublicHomeProps {
  file: StoryFile;
  settings: SettingsFile;
}

export const PublicHome = ({ file, settings }: PublicHomeProps) => {
  const router = useRouter();
  const { username } = router.query as { username: string };

  const siteName = settings.siteName || username;
  const twitterHandle = settings.siteTwitterHandle;

  const featuredStoryIndex = file.stories.findIndex((story) => story.featured);
  const stories = [...file.stories];
  if (featuredStoryIndex !== -1) {
    stories.splice(featuredStoryIndex, 1);
  }

  const seoUrl = `${sigleConfig.appUrl}/${username}`;
  const seoTitle = `${siteName} - Sigle`;
  const seoDescription =
    settings.siteDescription?.substring(0, 300) ||
    `Read stories from ${siteName} on Sigle, decentralised and open-source platform for Web3 writers`;
  const seoImage = settings.siteLogo;

  return (
    <React.Fragment>
      <NextSeo
        title={seoTitle}
        description={seoDescription}
        openGraph={{
          type: 'website',
          url: seoUrl,
          title: seoTitle,
          description: seoDescription,
          images: [
            {
              url: seoImage || `${sigleConfig.appUrl}/static/icon-192x192.png`,
            },
          ],
        }}
        twitter={{
          site: '@sigleapp',
          cardType: 'summary',
        }}
      />

      <Container>
        <AppHeader />
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
          <Flex css={{ pt: '$5' }} gap="3">
            {settings.siteUrl && (
              <PublicHomeSiteUrl siteUrl={settings.siteUrl} />
            )}
            {settings.siteUrl && settings.siteTwitterHandle && (
              <Box css={{ width: '1px', backgroundColor: '$gray9' }} />
            )}
            {settings.siteTwitterHandle && (
              <Text
                css={{
                  color: '$gray9',

                  '&:hover': {
                    color: '$gray10',
                  },
                  '&:active': {
                    color: '$gray12',
                  },
                }}
                size="sm"
                as="a"
                href={`https://twitter.com/${twitterHandle}`}
                target="_blank"
                rel="noreferrer"
              >
                {twitterHandle?.includes('@')
                  ? twitterHandle
                  : `@${twitterHandle}`}
              </Text>
            )}
          </Flex>
        </Header>
      </Container>

      <StyledContainer>
        {file.stories.length === 0 && <NoStories>No stories yet</NoStories>}
        {featuredStoryIndex !== -1 && (
          <PublicStoryItem
            username={username}
            story={file.stories[featuredStoryIndex]}
            settings={settings}
          />
        )}
        {stories.map((story) => (
          <PublicStoryItem
            key={story.id}
            username={username}
            story={story}
            settings={settings}
          />
        ))}

        <PoweredBy />
      </StyledContainer>
    </React.Fragment>
  );
};
