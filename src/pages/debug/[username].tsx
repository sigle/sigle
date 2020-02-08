import React, { useEffect } from 'react';
import { NextPage } from 'next';
import { lookupProfile } from 'blockstack';
import { config } from '../../config';

interface PublicHomePageProps {
  username: string;
}

const PublicHomePage: NextPage<PublicHomePageProps> = ({ username }) => {
  useEffect(() => {
    const test = async () => {
      let file;
      let statusCode: boolean | number = false;
      let userProfile;
      try {
        console.log('username', username);
        userProfile = await lookupProfile(username as string);
        console.log('userProfile', userProfile);
      } catch (error) {
        statusCode = 500;
        console.error(error);
        // This will happen if there is no blockstack user with this name
        if (error.message === 'Name not found') {
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
          console.log('file', file);
        } else if (data.status === 404) {
          // If file is not found we set an empty array to show an empty list
          file = { stories: [] };
        } else {
          statusCode = data.status;
        }
      } else {
        statusCode = 404;
      }

      console.log('statusCode', statusCode);
      console.log('file', file);

      return { statusCode, file };
    };

    test();
  }, []);

  return <div>debug</div>;
};
PublicHomePage.getInitialProps = async ({ query, res }) => {
  const { username } = query as { username: string };
  return { username };
};

export default PublicHomePage;
