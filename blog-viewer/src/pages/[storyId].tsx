import React from 'react';
import { GetServerSideProps } from 'next';
import { lookupProfile } from '@stacks/auth';
import * as Sentry from '@sentry/node';
import Error from '../pages/_error';
import { PublicStory } from '../modules/publicStory/PublicStory';
import { Story, SettingsFile } from '../types';
import { prismaClient } from '../utils/prisma';

const fetchPublicStory = async (
  bucketUrl: string,
  storyId: string
): Promise<{ file: Story; statusCode: false | number }> => {
  let file;
  let statusCode: false | number = false;
  const data = await fetch(`${bucketUrl}${storyId}.json`);
  if (data.status === 200) {
    file = await data.json();
  } else {
    statusCode = data.status;
  }
  return { file, statusCode };
};

const fetchSettings = async (
  bucketUrl: string
): Promise<{ file: SettingsFile; statusCode: false | number }> => {
  let file;
  let statusCode: false | number = false;
  const data = await fetch(`${bucketUrl}settings.json`);
  if (data.status === 200) {
    file = await data.json();
  } else if (data.status === 404) {
    // If file is not found we set an empty object
    file = {};
  } else {
    statusCode = data.status;
  }
  return { file, statusCode };
};

export const getServerSideProps: GetServerSideProps<PublicStoryPageProps> =
  async ({ req, res, params }) => {
    // If app is running on fly redirect all the http to https
    if (
      process.env.FLY_APP_NAME &&
      req.headers['x-forwarded-proto'] === 'http'
    ) {
      return {
        redirect: {
          destination: `https://${req.headers['host']}${req.url}`,
          permanent: false,
        },
        props: {} as any,
      };
    }

    const resolvedUser = await prismaClient.user.findUnique({
      where: { domain: req.headers['host'] },
    });

    const appUrl = `${req.headers['x-forwarded-proto'] || 'http'}://${
      req.headers['host']
    }`;

    // If domain is not allowed, redirect the user to the root domain
    if (!resolvedUser) {
      return {
        redirect: {
          destination: process.env.APP_URL,
          permanent: false,
        },
        props: {} as any,
      };
    }

    const storyId = params?.storyId as string;

    let file: Story | null = null;
    let settings: SettingsFile | null = null;
    let statusCode: boolean | number = false;
    let errorMessage: string | null = null;
    let userProfile: undefined | { apps?: Record<string, string> };
    try {
      userProfile = await lookupProfile({ username: resolvedUser.username });
    } catch (error) {
      // This will happen if there is no blockstack user with this name
      if (error.message === 'Name not found') {
        statusCode = 404;
      } else {
        statusCode = 500;
        errorMessage = `Blockstack lookupProfile returned error: ${error.message}`;
        Sentry.withScope((scope) => {
          scope.setExtras({
            username: resolvedUser.username,
            storyId,
            message: error.message,
          });
          Sentry.captureException(error);
        });
      }
    }

    const bucketUrl = userProfile?.apps?.[process.env.APP_URL!];

    // If the user already used the app we try to get the public list
    if (bucketUrl) {
      const [dataPublicStory, dataSettings] = await Promise.all([
        fetchPublicStory(bucketUrl, storyId),
        fetchSettings(bucketUrl),
      ]);

      file = dataPublicStory.file;
      if (dataPublicStory.statusCode) {
        statusCode = dataPublicStory.statusCode;
      }

      settings = dataSettings.file;
    } else if (!statusCode) {
      statusCode = 404;
    }

    // If statusCode is not false we set the http response code
    if (statusCode && res) {
      res.statusCode = statusCode as number;
    }

    return {
      props: {
        statusCode,
        errorMessage,
        appUrl,
        username: resolvedUser.username,
        file,
        settings,
      },
    };
  };

interface PublicStoryPageProps {
  statusCode: number | boolean;
  errorMessage?: string | null;
  appUrl: string;
  username: string;
  file: Story | null;
  settings: SettingsFile | null;
}

export default function PublicStoryPage({
  statusCode,
  errorMessage,
  appUrl,
  username,
  file,
  settings,
}: PublicStoryPageProps) {
  if (typeof statusCode === 'number') {
    return <Error statusCode={statusCode} errorMessage={errorMessage} />;
  }

  return (
    <PublicStory
      appUrl={appUrl}
      username={username}
      story={file!}
      settings={settings!}
    />
  );
}
