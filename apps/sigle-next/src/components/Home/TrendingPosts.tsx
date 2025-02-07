import { sigleApiClient } from '@/__generated__/sigle-api';
import { Card, Container, Heading, Link, Text } from '@radix-ui/themes';
import { formatReadableAddress } from '@/lib/stacks';
import NextLink from 'next/link';
import { Routes } from '@/lib/routes';
import { Carousel, CarouselContent, CarouselItem } from '../ui';
import { format } from 'date-fns';

export const HomeTrendingPosts = () => {
  const { data } = sigleApiClient.useSuspenseQuery('get', '/api/posts/list', {
    params: {
      query: {
        limit: 20,
      },
    },
  });

  return (
    <Container size="4" className="mt-10 px-4 md:mt-20">
      <Heading as="h3" size="5">
        Trending
      </Heading>

      <Carousel className="w-full mt-4">
        <CarouselContent>
          {data.map((post) => (
            <CarouselItem key={post.id} className="md:basis-1/2 lg:basis-1/4">
              <Card size="2">
                <div className="flex-1 space-y-2">
                  <NextLink
                    href={Routes.post({ postId: post.id })}
                    className="block"
                  >
                    <Heading
                      size="4"
                      className="line-clamp-2 break-words"
                      style={{
                        wordBreak: 'break-word',
                      }}
                    >
                      {post.metaTitle || post.title}
                    </Heading>
                  </NextLink>
                  <NextLink
                    href={Routes.post({ postId: post.id })}
                    className="block"
                  >
                    <Text
                      as="p"
                      size="2"
                      className="line-clamp-1 md:line-clamp-2"
                    >
                      {post.metaDescription || post.excerpt}
                    </Text>
                  </NextLink>
                  <div className="mt-3">
                    <Text as="p" color="gray" size="1">
                      By{' '}
                      <Link asChild>
                        <NextLink
                          href={Routes.userProfile({ username: post.user.id })}
                        >
                          {post.user.profile?.displayName
                            ? post.user.profile?.displayName
                            : formatReadableAddress(post.user.id)}
                        </NextLink>
                      </Link>{' '}
                      • {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                    </Text>
                  </div>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* <div className="grid grid-cols-2 gap-6 mt-5 md:grid-cols-5">
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
      </div> */}
    </Container>
  );
};
