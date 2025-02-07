'use client';

import type { paths } from '@/__generated__/sigle-api/openapi';
import { resolveImageUrl } from '@/lib/images';
import { Routes } from '@/lib/routes';
import {
  AspectRatio,
  Card,
  Flex,
  Heading,
  Inset,
  Link,
  Text,
} from '@radix-ui/themes';
import { format } from 'date-fns';
import NextLink from 'next/link';
import { useState } from 'react';
import { PostShareDialog } from '../PostShareDialog';
import { formatReadableAddress } from '@/lib/stacks';
import Image from 'next/image';

interface PublicationCardProps {
  post: paths['/api/posts/list']['get']['responses']['200']['content']['application/json'][0];
}

export const PublicationCard2 = ({ post }: PublicationCardProps) => {
  return (
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
                  placeholder={post.coverImage.blurhash ? 'blur' : 'empty'}
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
        <NextLink href={Routes.post({ postId: post.id })} className="block">
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
        <NextLink href={Routes.post({ postId: post.id })} className="block">
          <Text as="p" size="2" className="line-clamp-1 md:line-clamp-2">
            {post.metaDescription || post.excerpt}
          </Text>
        </NextLink>
        <div className="mt-3">
          <Text as="p" color="gray" size="1">
            By{' '}
            <Link asChild>
              <NextLink href={Routes.userProfile({ username: post.user.id })}>
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
  );
};
