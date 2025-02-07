'use client';

import { sigleApiClient } from '@/__generated__/sigle-api';
import {
  AspectRatio,
  Card,
  Container,
  Heading,
  Inset,
  Link,
  Text,
} from '@radix-ui/themes';
import { formatReadableAddress } from '@/lib/stacks';
import { Routes } from '@/lib/routes';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../ui';
import { format } from 'date-fns';
import Image from 'next/image';
import { resolveImageUrl } from '@/lib/images';
import { NextLink } from '../Shared/NextLink';

export const HomeTrendingPosts = () => {
  const { data: posts } = sigleApiClient.useSuspenseQuery(
    'get',
    '/api/posts/list',
    {
      params: {
        query: {
          limit: 20,
        },
      },
    },
  );

  return (
    <Container size="4" className="mt-10 px-4 md:mt-20">
      <Heading as="h3" size="5">
        Trending
      </Heading>

      <Carousel className="w-full mt-4">
        <CarouselContent>
          {posts.map((post) => (
            <CarouselItem key={post.id} className="md:basis-1/2 lg:basis-1/4">
              <Card size="2">
                <Inset clip="padding-box" side="top" pb="current">
                  <NextLink href={Routes.post({ postId: post.id })}>
                    <div className="overflow-hidden bg-gray-2">
                      <AspectRatio ratio={16 / 10}>
                        {post.coverImage ? (
                          <Image
                            src={resolveImageUrl(post.coverImage.id)}
                            alt="Cover card"
                            className="size-full object-cover"
                            placeholder={
                              post.coverImage.blurhash ? 'blur' : 'empty'
                            }
                            blurDataURL={post.coverImage.blurhash}
                            width={post.coverImage.width}
                            height={post.coverImage.height}
                          />
                        ) : null}
                      </AspectRatio>
                    </div>
                  </NextLink>
                </Inset>
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
        <CarouselPrevious color="gray" highContrast />
        <CarouselNext color="gray" highContrast />
      </Carousel>
    </Container>
  );
};
