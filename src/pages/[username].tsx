import React from 'react';
import { lookupProfile } from 'blockstack';
import { PublicHome } from '../modules/publicHome';
import { config } from '../config';
import { StoryFile } from '../types';
import Error from './_error';

interface PublicHomePageProps {
  statusCode: number | boolean;
  file: StoryFile;
}

const PublicHomePage = ({ statusCode, file }: PublicHomePageProps) => {
  if (typeof statusCode === 'number') {
    return <Error statusCode={statusCode} />;
  }

  return <PublicHome file={file} />;
};

PublicHomePage.getInitialProps = async ({
  query,
  res,
}: {
  query: any;
  res: any;
}) => {
  const { username } = query;
  let file;
  let statusCode: boolean | number = false;
  let userProfile;
  try {
    userProfile = await lookupProfile(username);
  } catch (error) {
    // This will happen if there is no blockstack user with this name
    if (error.message === 'Name not found') {
      statusCode = 404;
    }
  }

  const bucketUrl =
    userProfile && userProfile.apps && userProfile.apps[config.appUrl];
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

  // If statusCode is not false we set the http response code
  if (statusCode) {
    res.statusCode = statusCode;
  }
  return { statusCode, file };
};

export default PublicHomePage;
