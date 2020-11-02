import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { lookupProfile } from 'blockstack';
import * as Sentry from '@sentry/node';
import Error from '../../pages/_error';
import { PublicStory } from '../../modules/publicStory';
import { sigleConfig } from '../../config';
import { Story, SettingsFile } from '../../types';
import { migrationStory } from '../../utils/migrations/story';

interface PublicStoryPageProps {
  statusCode: number | boolean;
  errorMessage?: string | null;
  story: Story;
  settings: SettingsFile;
}

export const PublicStoryPage: NextPage<PublicStoryPageProps> = ({
  statusCode,
  errorMessage,
  story,
  settings,
}) => {
  if (typeof statusCode === 'number') {
    return <Error statusCode={statusCode} errorMessage={errorMessage} />;
  }

  return <PublicStory story={story} settings={settings} />;
};

const fetchPublicStory = async (bucketUrl: string, storyId: string) => {
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

const fetchSettings = async (bucketUrl: string) => {
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
  let story = null;
  let settings = null;
  let statusCode: boolean | number = false;
  let errorMessage: string | null = null;
  let userProfile;
  try {
    userProfile = await lookupProfile(username);
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

  // If deployed on vercel we want to get the deployment url to be able to test unmerged pr's
  // If client side we use window.location.origin
  const appUrl = req.headers['x-forwarded-host']
    ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}`
    : req.headers.host === 'localhost:3000'
    ? 'http://localhost:3000'
    : sigleConfig.appUrl;

  const bucketUrl = userProfile && userProfile.apps && userProfile.apps[appUrl];
  // If the user already used the app we try to get the public list
  if (bucketUrl) {
    const [dataPublicStory, dataSettings] = await Promise.all([
      fetchPublicStory(bucketUrl, storyId),
      fetchSettings(bucketUrl),
    ]);

    story = dataPublicStory.file
      ? migrationStory(dataPublicStory.file)
      : dataPublicStory.file;
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

  return { props: { statusCode, errorMessage, story, settings } };
};
