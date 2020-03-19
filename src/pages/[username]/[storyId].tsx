import React from 'react';
import { NextPage } from 'next';
import { lookupProfile } from 'blockstack';
import Error from '../_error';
import { PublicStory } from '../../modules/publicStory';
import { config } from '../../config';
import { Story, SettingsFile } from '../../types';

interface PublicStoryPageProps {
  statusCode: number | boolean;
  file: Story;
  settings: SettingsFile;
}

const PublicStoryPage: NextPage<PublicStoryPageProps> = ({
  statusCode,
  file,
  settings,
}) => {
  if (typeof statusCode === 'number') {
    return <Error statusCode={statusCode} />;
  }

  return <PublicStory story={file} settings={settings} />;
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

PublicStoryPage.getInitialProps = async ({ query, req, res }) => {
  const { username, storyId } = query as { username: string; storyId: string };
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
  // If client side we use window.location.origin
  const appUrl = !req
    ? window.location.origin
    : req && req.headers['x-forwarded-host']
    ? `${req.headers['x-forwarded-proto']}://${req.headers['x-forwarded-host']}`
    : config.appUrl;

  const bucketUrl = userProfile && userProfile.apps && userProfile.apps[appUrl];
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
  } else {
    statusCode = 404;
  }

  // If statusCode is not false we set the http response code
  if (statusCode && res) {
    res.statusCode = statusCode as number;
  }
  return { statusCode, file, settings };
};

export default PublicStoryPage;
