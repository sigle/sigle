import React from 'react';
import { NextPage } from 'next';
import { getUserAppFileUrl } from 'blockstack';
import Error from '../_error';
import { PublicStory } from '../../modules/publicStory';
import { config } from '../../config';
import { Story } from '../../types';

interface PublicStoryPageProps {
  file: Story;
  statusCode: number | boolean;
}

const PublicStoryPage: NextPage<PublicStoryPageProps> = ({
  file,
  statusCode,
}) => {
  if (typeof statusCode === 'number') {
    return <Error statusCode={statusCode} />;
  }

  return <PublicStory story={file} />;
};

PublicStoryPage.getInitialProps = async ({ query, res }) => {
  const { username, storyId } = query as { username: string; storyId: string };
  let file;
  let statusCode: boolean | number = false;
  let fileUrl;

  try {
    fileUrl = await getUserAppFileUrl(storyId, username, config.appUrl);
  } catch (error) {
    statusCode = 500;
    if (error.message === 'Name not found') {
      statusCode = 404;
    }
  }

  if (fileUrl) {
    fileUrl = `${fileUrl}.json`;
    const data = await fetch(fileUrl);
    if (data.status === 200) {
      file = await data.json();
    } else {
      statusCode = data.status;
    }
  } else {
    statusCode = 404;
  }

  // If statusCode is not false we set the http response code
  if (statusCode && res) {
    res.statusCode = statusCode;
  }
  return { statusCode, file };
};

export default PublicStoryPage;
