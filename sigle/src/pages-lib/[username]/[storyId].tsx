import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { lookupProfile } from '@stacks/auth';
import * as Sentry from '@sentry/nextjs';
import Error from '../../pages/_error';
import { PublicStory } from '../../modules/publicStory';
import { Story, SettingsFile } from '../../types';

interface PublicStoryPageProps {
  statusCode: number | boolean;
  errorMessage?: string | null;
  file: Story | null;
  settings: SettingsFile | null;
}

export const PublicStoryPage: NextPage<PublicStoryPageProps> = ({
  statusCode,
  errorMessage,
  file,
  settings,
}) => {
  if (typeof statusCode === 'number') {
    return <Error statusCode={statusCode} errorMessage={errorMessage} />;
  }

  return <PublicStory story={file!} settings={settings!} />;
};

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

export const getServerSideProps: GetServerSideProps<PublicStoryPageProps> = async ({
  req,
  res,
  params,
}) => {
  const username = params?.username as string;
  const storyId = params?.storyId as string;

  let file: Story | null = null;
  let settings: SettingsFile | null = null;
  let statusCode: boolean | number = false;
  let errorMessage: string | null = null;
  let userProfile: undefined | { apps?: Record<string, string> };
  try {
    userProfile = await lookupProfile({ username });
  } catch (error) {
    // This will happen if there is no blockstack user with this name
    if (error.message === 'Name not found') {
      statusCode = 404;
    } else {
      statusCode = 500;
      errorMessage = `Blockstack lookupProfile returned error: ${error.message}`;
      Sentry.withScope((scope) => {
        scope.setExtras({
          username,
          storyId,
        });
        Sentry.captureException(error);
      });
    }
  }

  const appHost =
    (req.headers['x-forwarded-host'] as string) ||
    (req.headers['host'] as string);
  const appProto = (req.headers['x-forwarded-proto'] as string) || 'http';
  const appUrl = `${appProto}://${appHost}`;

  const bucketUrl = userProfile?.apps?.[appUrl];
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

  return { props: { statusCode, errorMessage, file, settings } };
};
