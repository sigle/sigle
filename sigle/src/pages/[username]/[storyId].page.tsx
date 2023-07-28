import React from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { resolveZoneFileToProfile } from '@stacks/profile';
import * as Sentry from '@sentry/nextjs';
import {
  BnsGetNameInfoResponse,
  NamesApi,
} from '@stacks/blockchain-api-client';
import sanitizeHtml from 'sanitize-html';
import Error from '../_error.page';
import { PublicStory } from '../../modules/publicStory/PublicStory';
import { Story, SettingsFile } from '../../types';
import { migrationStory } from '../../utils/migrations/story';
import { sigleConfig } from '../../config';
import { redirectUsernameMap } from '../../utils/redirectUsername';

interface PublicStoryPageProps {
  statusCode: number | boolean;
  errorMessage: string | null;
  file: Story | null;
  settings: SettingsFile | null;
  userInfo: { username: string; address: string } | null;
}

export const PublicStoryPage: NextPage<PublicStoryPageProps> = ({
  statusCode,
  errorMessage,
  file,
  settings,
  userInfo,
}) => {
  if (typeof statusCode === 'number') {
    return <Error statusCode={statusCode} errorMessage={errorMessage} />;
  }

  return (
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    <PublicStory story={file!} settings={settings!} userInfo={userInfo!} />
  );
};

const fetchPublicStory = async (
  bucketUrl: string,
  storyId: string,
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
  bucketUrl: string,
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

export const getServerSideProps: GetServerSideProps<
  PublicStoryPageProps
> = async ({ req, res, params }) => {
  const username = params?.username as string;
  const storyId = params?.storyId as string;

  // Redirect blog when user move from .id.blocktack to .btc
  if (redirectUsernameMap[username]) {
    return {
      redirect: {
        statusCode: 301,
        destination: `/${redirectUsernameMap[username]}/${storyId}`,
      },
      props: {},
    };
  }

  let file: Story | null = null;
  let settings: SettingsFile | null = null;
  let statusCode: boolean | number = false;
  let errorMessage: string | null = null;
  let userProfile: undefined | { apps?: Record<string, string> };
  let nameInfo: BnsGetNameInfoResponse | null = null;
  try {
    const stacksNamesApi = new NamesApi();
    nameInfo = await stacksNamesApi.getNameInfo({ name: username });
  } catch (error) {
    // This will happen if there is no Stacks user with this name
    if (error.status === 404) {
      statusCode = 404;
    } else {
      statusCode = 500;
      errorMessage = `Failed to fetch name info: ${error.message}`;
      Sentry.withScope((scope) => {
        scope.setExtras({
          username,
        });
        Sentry.captureException(error);
      });
    }
  }

  try {
    if (nameInfo) {
      userProfile = await resolveZoneFileToProfile(
        nameInfo.zonefile,
        nameInfo.address,
      );
    }
  } catch (error) {
    statusCode = 500;
    errorMessage = `resolveZoneFileToProfile returned error: ${error.message}`;
    Sentry.withScope((scope) => {
      scope.setExtras({
        username,
      });
      Sentry.captureException(error);
    });
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

  /**
   * 1. Migrate the story to the new format.
   * 2. Sanitize the HTML of the story so it's safe to display to external users.
   * Only allow a subset of tags and attributes to avoid XSS attacks.
   */
  if (file) {
    file = migrationStory(file);
    file.content = file.content
      ? sanitizeHtml(file.content, {
          allowedTags: [
            'div',
            'br',
            // Titles
            'h2',
            'h3',
            // Paragraphs
            'p',
            // Lists
            'ul',
            'ol',
            'li',
            // Links
            'a',
            // Blockquotes
            'blockquote',
            // Divider
            'hr',
            // Code
            'code',
            'pre',
            // Images
            'img',
            // Marks
            'strong',
            'em',
            'u',
            's',
            'sub',
            'sup',
            'span',
            // button-cta
            'button',
          ],
          allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            a: [
              // Default
              'href',
              'name',
              'target',
              // button-cta
              'data-type',
            ],
            code: ['class'],
            div: ['data-twitter', 'data-twitter-id'],
            button: [
              // button-cta
              'data-size',
            ],
          },
        })
      : '';
  }

  // If statusCode is not false we set the http response code
  if (statusCode && res) {
    res.statusCode = statusCode as number;
  }

  return {
    props: {
      statusCode,
      errorMessage,
      file,
      settings,
      userInfo: nameInfo ? { address: nameInfo.address, username } : null,
    },
  };
};

export default PublicStoryPage;
