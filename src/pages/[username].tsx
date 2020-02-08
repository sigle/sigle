import React from 'react';
import { NextPage } from 'next';
import { lookupProfile } from 'blockstack';
import { PublicHome } from '../modules/publicHome';
import { config } from '../config';
import { StoryFile } from '../types';
import Error from './_error';

interface PublicHomePageProps {
  statusCode: number | boolean;
  file: StoryFile;
}

const PublicHomePage: NextPage<PublicHomePageProps> = ({
  statusCode,
  file,
}) => {
  if (typeof statusCode === 'number') {
    return <Error statusCode={statusCode} />;
  }

  return <PublicHome file={file} />;
};

PublicHomePage.getInitialProps = async ({ query, res }) => {
  const { username } = query as { username: string };
  let file;
  let statusCode: boolean | number = false;
  let userProfile;

  try {
    console.log('username', username);
    userProfile = await lookupProfile(username);
    console.log('userProfile', true);
  } catch (error) {
    statusCode = 500;
    console.error('error', error);
    // This will happen if there is no blockstack user with this name
    if (error && error.message === 'Name not found') {
      statusCode = 404;
    }
  }

  const bucketUrl =
    userProfile && userProfile.apps && userProfile.apps[config.appUrl];
  console.log('bucketUrl', bucketUrl);
  // If the user already used the app we try to get the public list
  if (bucketUrl) {
    const data = await fetch(`${bucketUrl}publicStories.json`);
    if (data.status === 200) {
      file = await data.json();
    } else if (data.status === 404) {
      // If file is not found we set an empty array to show an empty list
      file = { stories: [] };
    } else {
      statusCode = data.status;
    }
  } else {
    statusCode = 404;
  }

  console.log('stories', file.stories.length);
  console.log('statusCode', statusCode);

  // If statusCode is not false we set the http response code
  if (statusCode && res) {
    res.statusCode = statusCode;
  }
  return { statusCode, file };
};

export default PublicHomePage;
