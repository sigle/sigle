import React from 'react';
import { NextSeo } from 'next-seo';
import { StoryFile, SettingsFile } from '../../../types';
import { sigleConfig } from '../../../config';
import { useAuth } from '../../auth/AuthContext';
import { DashboardLayout } from '../../layout';
import { ProfilePageContent } from './ProfileContent';

interface PublicHomeProps {
  file: StoryFile;
  settings: SettingsFile;
  userInfo: { username: string; address: string };
}

export const PublicHome = ({ file, settings, userInfo }: PublicHomeProps) => {
  const { user } = useAuth();
  const siteName = settings.siteName || userInfo.username;

  const seoUrl = `${sigleConfig.appUrl}/${userInfo.username}`;
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
        additionalLinkTags={[
          {
            rel: 'alternate',
            type: 'application/rss+xml',
            // @ts-expect-error title is missing in next-seo
            title: seoTitle,
            href: `${sigleConfig.appUrl}/api/feed/${userInfo.username}`,
          },
        ]}
      />
      {userInfo.username !== user?.username ? (
        <ProfilePageContent
          file={file}
          settings={settings}
          userInfo={userInfo}
        />
      ) : (
        <DashboardLayout>
          <ProfilePageContent
            file={file}
            settings={settings}
            userInfo={userInfo}
          />
        </DashboardLayout>
      )}
    </React.Fragment>
  );
};
