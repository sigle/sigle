import { sigleApiClient } from '@/__generated__/sigle-api';
import { Button, Card, Container, Heading, Text } from '@radix-ui/themes';
import { ProfileAvatar } from '../Shared/Profile/ProfileAvatar';
import { formatReadableAddress } from '@/lib/stacks';
import NextLink from 'next/link';
import { Routes } from '@/lib/routes';

export const HomeTrendingUsers = () => {
  const { data } = sigleApiClient.useSuspenseQuery(
    'get',
    '/api/users/trending',
  );

  return (
    <Container size="4" className="mt-10 px-4 md:mt-20">
      <Heading as="h3" size="4">
        Trending Authors
      </Heading>

      <div className="grid grid-cols-2 gap-6 mt-5 md:grid-cols-5">
        {data.map((user) => (
          <Card
            key={user.id}
            size="2"
            className="flex flex-col items-center gap-2 p-5"
          >
            <ProfileAvatar user={user} size="8" />
            <Text as="p" size="3" className="truncate">
              {user.profile?.displayName
                ? user.profile?.displayName
                : formatReadableAddress(user.id)}
            </Text>

            <Button color="gray" className="mt-5">
              <NextLink href={Routes.userProfile({ username: user.id })}>
                Discover
              </NextLink>
            </Button>
          </Card>
        ))}
      </div>
    </Container>
  );
};
