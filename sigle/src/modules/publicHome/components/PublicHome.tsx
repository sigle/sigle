import React from 'react';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { StoryFile, SettingsFile } from '../../../types';
import { Container } from '../../../components';
import { PublicStoryItem } from './PublicStoryItem';
import { PoweredBy } from '../../publicStory/PoweredBy';
import { AppHeader } from '../../layout/components/AppHeader';
import { Box, Flex, Typography } from '../../../ui';
import { sigleConfig } from '../../../config';
import { styled } from '../../../stitches.config';

const StyledContainer = styled(Container, {
  pt: '$4',
  pb: '$15',
  maxWidth: 768,
});

const Header = styled('div', {
  py: '$10',
  display: 'flex',
  flexDirection: 'column',
  placeItems: 'center',
});

const HeaderLogo = styled('img', {
  mb: '$4',
});

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
    <Typography
      css={{
        color: '$gray9',

        '&:hover': {
          color: '$gray10',
        },
        '&:active': {
          color: '$gray12',
        },
      }}
      size="subheading"
      as="a"
      href={fullUrl}
      target="_blank"
      rel="noreferrer"
    >
      {displayUrl}
    </Typography>
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
      <AppHeader />
      <Header>
        {settings.siteLogo && (
          <HeaderLogo src={settings.siteLogo} alt={`${siteName} logo`} />
        )}
        <Typography css={{ fontWeight: 700 }} as="h1" size="h2">
          {siteName}
        </Typography>
        {settings.siteDescription &&
          settings.siteDescription.split('\n').map((text, index) => (
            <Typography
              size="subheading"
              css={{ mt: '$2', textAlign: 'center' }}
              key={index}
            >
              {text}
            </Typography>
          ))}
        <Flex css={{ pt: '$5' }} gap="3">
          {settings.siteUrl && <PublicHomeSiteUrl siteUrl={settings.siteUrl} />}
          {settings.siteUrl && settings.siteTwitterHandle && (
            <Box css={{ width: '1px', backgroundColor: '$gray9' }} />
          )}
          {settings.siteTwitterHandle && (
            <Typography
              css={{
                color: '$gray9',

                '&:hover': {
                  color: '$gray10',
                },
                '&:active': {
                  color: '$gray12',
                },
              }}
              size="subheading"
              as="a"
              href={`https://twitter.com/${twitterHandle}`}
              target="_blank"
              rel="noreferrer"
            >
              {twitterHandle?.includes('@')
                ? twitterHandle
                : `@${twitterHandle}`}
            </Typography>
          )}
        </Flex>
      </Header>

      <StyledContainer>
        {file.stories.length === 0 && (
          <Typography css={{ mt: '$8', textAlign: 'center' }}>
            No stories yet
          </Typography>
        )}
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
