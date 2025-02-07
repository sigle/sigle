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
import NextLink from 'next/link';
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
import { PublicationCard2 } from '../Shared/Post/Card2';

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
              <PublicationCard2 post={post} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious color="gray" highContrast />
        <CarouselNext color="gray" highContrast />
      </Carousel>
    </Container>
  );
};
