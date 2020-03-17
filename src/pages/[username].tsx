import React from 'react';
import { NextPage } from 'next';
import { lookupProfile } from 'blockstack';
import { PublicHome } from '../modules/publicHome';
import { config } from '../config';
import { StoryFile, SettingsFile } from '../types';
import Error from './_error';

interface PublicHomePageProps {
  statusCode: number | boolean;
  file: StoryFile;
  settings: SettingsFile;
}

const PublicHomePage: NextPage<PublicHomePageProps> = ({
  statusCode,
  file,
  settings,
}) => {
  if (typeof statusCode === 'number') {
    return <Error statusCode={statusCode} />;
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

PublicHomePage.getInitialProps = async ({ query, req, res }) => {
  const { username } = query as { username: string };
  let file;
  let settings;
  let statusCode: boolean | number = false;
  let userProfile;
  try {
    userProfile = await lookupProfile(username);
  } catch (error) {
    statusCode = 500;
    // This will happen if there is no blockstack user with this name
    if (error.message === 'Name not found') {
      statusCode = 404;
    }
  }

  // If deployed on now we want to get the deployment url to be able to test unmerged pr's
  const appUrl =
    (req?.headers['x-now-deployment-url'] as string) ?? config.appUrl;

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
  } else {
    statusCode = 404;
  }

  // If statusCode is not false we set the http response code
  if (statusCode && res) {
    res.statusCode = statusCode as number;
  }
  return { statusCode, file, settings };
};

export default PublicHomePage;
