import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { lookupProfile } from 'blockstack';
import * as Sentry from '@sentry/node';
import { GraphQLClient } from 'graphql-request';
import fetch from 'node-fetch';
import Error from '../../pages/_error';
import { PublicStory } from '../../modules/publicStory';
import { sigleConfig } from '../../config';
import { Story, SettingsFile } from '../../types';
import { getSdk } from '../../generated/graphql';

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

  const client = new GraphQLClient('https://graphql.fauna.com/graphql', {
    headers: {
      Authorization: `Bearer ${sigleConfig.faunaSecret}`,
    },
  });
  const sdk = getSdk(client);
  const data = await sdk.findUserStory({ username, id: storyId });

  // If story is found in indexer we can serve it directly
  if (data) {
    // TODO return the data so it can be rendered directly
  }

  let file: Story | null = null;
  let settings: SettingsFile | null = null;
  let statusCode: boolean | number = false;
  let errorMessage: string | null = null;
  let userProfile: undefined | { apps?: Record<string, string> };
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

  // If story is found we start a task to add it to the indexer
  if (file && !data) {
    // No need to await here as the task can be done in background
    fetch(`${sigleConfig.appUrl}/api/update_story`, {
      method: 'POST',
      body: JSON.stringify({
        username,
        storyId,
      }),
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return { props: { statusCode, errorMessage, file, settings } };
};
