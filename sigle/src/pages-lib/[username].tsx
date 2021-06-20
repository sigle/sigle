import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { lookupProfile } from '@stacks/auth';
import * as Sentry from '@sentry/nextjs';
import { PublicHome } from '../modules/publicHome';
import { sigleConfig } from '../config';
import { StoryFile, SettingsFile } from '../types';
import Error from '../pages/_error';

interface PublicHomePageProps {
  statusCode: number | boolean;
  errorMessage: string | null;
  file: StoryFile;
  settings: SettingsFile;
}

export const PublicHomePage: NextPage<PublicHomePageProps> = ({
  statusCode,
  errorMessage,
  file,
  settings,
}) => {
  if (typeof statusCode === 'number') {
    return <Error statusCode={statusCode} errorMessage={errorMessage} />;
  }

  return <PublicHome file={file} settings={settings} />;
};

const fetchPublicStories = async (bucketUrl: string) => {
  let file;
  let statusCode: false | number = false;
  const data = await fetch(`${bucketUrl}publicStories.json`);
  if (data.status === 200) {
    file = await data.json();
  } else if (data.status === 404) {
    // If file is not found we set an empty array to show an empty list
    file = { stories: [] };
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

export const getServerSideProps: GetServerSideProps<PublicHomePageProps> = async ({
  req,
  res,
  params,
}) => {
  const username = params?.username as string;
  let file = null;
  let settings = null;
  let statusCode: boolean | number = false;
  let errorMessage: string | null = null;
  let userProfile;
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
    const [dataPublicStories, dataSettings] = await Promise.all([
      fetchPublicStories(bucketUrl),
      fetchSettings(bucketUrl),
    ]);

    file = dataPublicStories.file;
    if (dataPublicStories.statusCode) {
      statusCode = dataPublicStories.statusCode;
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
    props: { statusCode, errorMessage, file, settings },
  };
};
