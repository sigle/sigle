import { GetServerSideProps } from 'next';
import * as Sentry from '@sentry/node';
import { lookupProfile } from '@stacks/auth';
import { SettingsFile, StoryFile } from '../types';
import Error from './_error';
import { PublicHome } from '../modules/publicHome/PublicHome';
import { prismaClient } from '../utils/prisma';

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

export const getServerSideProps: GetServerSideProps<PublicHomePageProps> =
  async ({ req, res }) => {
    // If app is running on fly redirect all the http to https
    if (
      process.env.FLY_APP_NAME &&
      req.headers['x-forwarded-proto'] === 'http'
    ) {
      return {
        redirect: {
          destination: `https://${req.headers['host']}${req.url}`,
          permanent: false,
        },
        props: {} as any,
      };
    }

    // First time the server is started in dev we need to create the first user
    // Just uncomment these lines to get it created for you
    // await prismaClient.user.create({
    //   data: {
    //     username: 'sigleapp.id.blockstack',
    //     domain: 'localhost:3001',
    //   },
    // });

    const resolvedUser = await prismaClient.user.findUnique({
      where: { domain: req.headers['host'] },
    });

    // If domain is not allowed, redirect the user to the root domain
    if (!resolvedUser) {
      return {
        redirect: {
          destination: process.env.APP_URL,
          permanent: false,
        },
        props: {} as any,
      };
    }

    let file = null;
    let settings = null;
    let statusCode: boolean | number = false;
    let errorMessage: string | null = null;
    let userProfile: Record<string, any> | undefined;
    try {
      userProfile = await lookupProfile({ username: resolvedUser.username });
    } catch (error) {
      // This will happen if there is no blockstack user with this name
      if (error.message === 'Name not found') {
        statusCode = 404;
      } else {
        statusCode = 500;
        errorMessage = `Stacks.js lookupProfile returned error: ${error.message}`;
        Sentry.withScope((scope) => {
          scope.setExtras({
            username: resolvedUser.username,
            message: error.message,
          });
          Sentry.captureException(error);
        });
      }
    }

    const bucketUrl = userProfile?.apps?.[process.env.APP_URL!];

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
      props: {
        statusCode,
        errorMessage,
        username: resolvedUser.username,
        file,
        settings,
      },
    };
  };

interface PublicHomePageProps {
  statusCode: number | boolean;
  errorMessage: string | null;
  username: string;
  file: StoryFile;
  settings: SettingsFile;
}

export default function Home({
  statusCode,
  errorMessage,
  username,
  file,
  settings,
}: PublicHomePageProps) {
  if (typeof statusCode === 'number') {
    return <Error statusCode={statusCode} errorMessage={errorMessage} />;
  }

  return <PublicHome username={username} file={file} settings={settings} />;
}
