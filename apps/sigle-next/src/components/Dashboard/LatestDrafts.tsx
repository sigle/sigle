'use client';

import { sigleApiClient } from '@/__generated__/sigle-api';
import { getExplorerTransactionUrl } from '@/lib/stacks';
import {
  Badge,
  Button,
  Card,
  Flex,
  Heading,
  Spinner,
  Text,
} from '@radix-ui/themes';
import { format } from 'date-fns';
import { NextLink } from '../Shared/NextLink';

export const LatestDrafts = () => {
  const {
    data: drafts,
    isLoading: loadingDrafts,
    error: errorDrafts,
  } = sigleApiClient.useQuery('get', '/api/protected/drafts/list', {
    params: {
      query: {
        limit: 5,
      },
    },
  });

  return (
    <div>
      <Flex justify="between" align="center">
        <Text size="2">Drafts</Text>
        <Button size="1" color="gray" variant="ghost">
          <NextLink href="/dashboard/drafts">View all</NextLink>
        </Button>
      </Flex>
      <Card mt="2" size="2">
        {loadingDrafts ? (
          <Flex justify="center" py="7">
            <Spinner />
          </Flex>
        ) : null}

        {errorDrafts ? (
          <Flex justify="center" py="7">
            <Text size="2" color="red">
              An error occurred, please try again later. Error:{' '}
              {errorDrafts.message}
            </Text>
          </Flex>
        ) : null}

        {!loadingDrafts && drafts?.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-7">
            <Text size="2" color="gray">
              No drafts yet
            </Text>
            <Button size="2" color="gray" highContrast>
              <NextLink href="/p/new">Create a new draft</NextLink>
            </Button>
          </div>
        ) : null}

        {drafts?.map((draft) => {
          const heading =
            draft.metaTitle || draft.title ? (
              <Heading as="h3" size="4" className="line-clamp-2">
                {draft.metaTitle || draft.title}
              </Heading>
            ) : (
              <Heading as="h3" size="4" className="line-clamp-2" color="gray">
                No title
              </Heading>
            );

          return (
            <div
              key={draft.id}
              className="border-b border-solid border-gray-6 py-5 first:pt-0 last:border-b-0 last:pb-0"
            >
              {draft.txStatus === 'pending' && draft.txId && (
                <Badge className="mb-2" asChild>
                  <a
                    href={getExplorerTransactionUrl(draft.txId)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Publishing: Transaction pending
                  </a>
                </Badge>
              )}
              {draft.txStatus === 'pending' ? (
                heading
              ) : (
                <NextLink href={`/p/${draft.id}/edit`}>{heading}</NextLink>
              )}
              <Text as="p" mt="3" color="gray" size="1" className="uppercase">
                {format(new Date(draft.createdAt), 'MMM dd')}
              </Text>
            </div>
          );
        })}
      </Card>
    </div>
  );
};
