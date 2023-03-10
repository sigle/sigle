import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React from 'react';
import * as Sentry from '@sentry/nextjs';
import { toast } from 'react-toastify';
import { Protected } from '../../modules/auth/Protected';
import { getStoryFile } from '../../utils';
import { migrationStory } from '../../utils/migrations/story';
import { DashboardLayout } from '../../modules/layout';
import { Typography } from '../../ui';
import { useAuth } from '../../modules/auth/AuthContext';
import { appConfig } from '../../utils/blockstack';
import { styled } from '../../stitches.config';

const StyledCode = styled('code', {
  display: 'block',
  padding: '1rem',
  margin: '1rem 0',
  background: '$gray3',
  borderRadius: '$1',
  fontSize: '$1',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  maxHeight: '200px',
  overflow: 'auto',
});

const Inscribe = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { storyId } = router.query as { storyId: string };

  const { data } = useQuery(
    ['story', storyId],
    async () => {
      const file = await getStoryFile(storyId);
      return file ? migrationStory(file) : file;
    },
    {
      enabled: Boolean(storyId),
      cacheTime: 0,
      onError: (error: Error | string) => {
        Sentry.captureException(error);
        toast.error(typeof error === 'string' ? error : error.message);
      },
    }
  );

  if (!data) {
    return null;
  }

  const parsedData = {
    p: 'ons',
    op: 'post',
    title: data.title,
    url: `${appConfig.appDomain}/${user?.username}/${storyId}`,
    author: user?.username,
    body: data.content,
  };

  console.log('data', data);

  return (
    <DashboardLayout>
      <Typography size="h2">Inscribe</Typography>
      <StyledCode>{JSON.stringify(parsedData, null, 2)}</StyledCode>
    </DashboardLayout>
  );
};

const InscribePage = () => {
  return (
    <Protected>
      <Inscribe />
    </Protected>
  );
};

export default InscribePage;
