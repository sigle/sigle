import React from 'react';
import Link from 'next/link';
import { StarFilledIcon } from '@radix-ui/react-icons';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import format from 'date-fns/format';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  Flex,
  Heading,
  Text,
  DropdownMenuSeparator,
  IconButton,
  Box,
} from '../../../ui';
import { SubsetStory, BlockstackUser } from '../../../types';
import { darkTheme, styled } from '../../../stitches.config';

const StoryContainer = styled('div', {
  display: 'flex',
  borderBottom: '1px solid $colors$gray6',
  py: '$7',
  gap: '$5',
  alignItems: 'center',

  '& img': {
    transform: 'none',
    transition: 'transform .5s .1s',
  },

  '&:hover': {
    '& img': {
      transform: 'scale(1.1)',
      transition: 'transform .5s .1s',
    },
    '& h4': {
      color: '$gray12',
    },
  },
});

const StoryImage = styled('img', {
  objectFit: 'cover',
  objectPosition: 'center',
  width: 80,
  height: 58,
  zIndex: -1,
  position: 'relative',

  '@md': {
    width: 180,
    height: 130,
  },
});

interface Props {
  user: BlockstackUser;
  story: SubsetStory;
  type: 'public' | 'private';
  onEdit: () => void;
  onDelete: () => void;
  showDeleteDialog: boolean;
  deleteLoading: boolean;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onFeature: () => void;
  showFeatureDialog: boolean;
  featureLoading: boolean;
  onCancelFeature: () => void;
  onConfirmFeature: () => void;
  onUnFeature: () => void;
  showUnFeatureDialog: boolean;
  unFeatureLoading: boolean;
  onCancelUnFeature: () => void;
  onConfirmUnFeature: () => void;
}

export const StoryItem = ({
  user,
  story,
  type,
  onEdit,
  onDelete,
  showDeleteDialog,
  deleteLoading,
  onCancelDelete,
  onConfirmDelete,
  onFeature,
  showFeatureDialog,
  featureLoading,
  onCancelFeature,
  onConfirmFeature,
  onUnFeature,
  showUnFeatureDialog,
  unFeatureLoading,
  onCancelUnFeature,
  onConfirmUnFeature,
}: Props) => {
  return (
    <React.Fragment>
      <StoryContainer
        css={{
          '@md': {
            gap: !story.coverImage && story.featured ? '$5' : '$7',
          },
        }}
      >
        {!story.coverImage && story.featured && (
          <Box
            css={{
              p: '$2',
              backgroundColor: '$gray1',
              br: '$round',
              color: '$orange10',
            }}
          >
            <StarFilledIcon />
          </Box>
        )}
        {story.coverImage && (
          <Link
            href="/stories/[storyId]"
            as={`/stories/${story.id}`}
            passHref
            legacyBehavior
          >
            <Box
              css={{
                borderRadius: '$1',
                lineHeight: 0,
                position: 'relative',
              }}
              as="a"
            >
              <Box
                as="span"
                css={{
                  display: 'inline-block',
                  position: 'relative',
                  maxWidth: 'inherit',
                  overflow: 'hidden',
                  borderRadius: '$1',

                  '&::before': {
                    content: '',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: '$gray11',
                    opacity: 0,
                    transition: '.2s',

                    [`.${darkTheme} &`]: {
                      backgroundColor: '$colors$gray1',
                    },
                  },

                  '&:hover::before': {
                    opacity: 0.1,
                  },
                }}
              >
                {story.featured && (
                  <Box
                    css={{
                      p: '$2',
                      backgroundColor: '$gray1',
                      br: '$round',
                      color: '$orange10',
                      position: 'absolute',
                      top: '-$2',
                      right: '-$2',
                    }}
                  >
                    <StarFilledIcon />
                  </Box>
                )}
                <StoryImage src={story.coverImage} />
              </Box>
            </Box>
          </Link>
        )}
        <Flex direction="column" css={{ flex: 1 }}>
          <Box
            css={{
              '@md': {
                mb: '$5',
              },
            }}
          >
            <Flex
              justify="between"
              css={{ gap: '$5', mb: '$1', '@md': { mb: '$2' } }}
            >
              <Link
                href="/stories/[storyId]"
                as={`/stories/${story.id}`}
                passHref
              >
                <Heading
                  css={{
                    fontSize: '$2',
                    lineHeight: '20.4px',
                    alignSelf: 'center',
                    fontWeight: 600,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    '-webkit-line-clamp': 3,
                    '-webkit-box-orient': 'vertical',
                    textOverflow: 'ellipsis',

                    '@md': {
                      fontSize: '18px',
                      lineHeight: '1.5rem',
                      '-webkit-line-clamp': 2,
                    },
                  }}
                  as="h4"
                >
                  {story.title}
                </Heading>
              </Link>
              <Flex align="center" gap="3">
                {user && story.type === 'private' && (
                  <Box
                    css={{
                      display: 'none',

                      '@md': {
                        backgroundColor: '$gray3',
                        py: '$1',
                        px: '$3',
                        br: '$1',
                        fontSize: '$2',
                      },
                    }}
                  >
                    Draft
                  </Box>
                )}
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <IconButton
                        size="sm"
                        css={{ alignSelf: 'start', p: '$1' }}
                        aria-label="Story settings"
                      >
                        <DotsHorizontalIcon width={22} height={22} />
                      </IconButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {type === 'public' && (
                        <DropdownMenuItem
                          as="a"
                          href={`/${user.username}/${story.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View my story
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onSelect={onEdit}>
                        Edit
                      </DropdownMenuItem>
                      {type === 'public' && (
                        <DropdownMenuItem
                          as={Link}
                          href={`/inscribe/${story.id}`}
                        >
                          Inscribe
                        </DropdownMenuItem>
                      )}
                      {!story.featured && type === 'public' && (
                        <DropdownMenuItem onSelect={onFeature}>
                          Feature this story
                        </DropdownMenuItem>
                      )}
                      {story.featured && type === 'public' && (
                        <DropdownMenuItem onSelect={onUnFeature}>
                          Un-feature this story
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem color="red" onSelect={onDelete}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </Flex>
            </Flex>
            <Link
              href="/stories/[storyId]"
              as={`/stories/${story.id}`}
              passHref
              legacyBehavior
            >
              <Text size="xs" as="a">
                {format(story.createdAt, 'MMMM dd, yyyy ')}
                at
                {format(story.createdAt, ' hh:mmaaa')}
              </Text>
            </Link>
          </Box>
          <Box css={{ flex: 1 }}>
            <Link
              href="/stories/[storyId]"
              as={`/stories/${story.id}`}
              passHref
              legacyBehavior
            >
              <Text
                as="a"
                size="action"
                css={{
                  display: 'none',

                  '@md': {
                    overflow: 'hidden',
                    display: '-webkit-box',
                    '-webkit-line-clamp': 2,
                    '-webkit-box-orient': 'vertical',
                    textOverflow: 'ellipsis',
                    color: '$gray11',
                  },
                }}
              >
                {story.content}
              </Text>
            </Link>
          </Box>
        </Flex>
      </StoryContainer>

      <Dialog open={showFeatureDialog} onOpenChange={onCancelFeature}>
        <DialogContent>
          <DialogTitle asChild>
            <Heading as="h2" size="xl" css={{ mb: '$3' }}>
              Feature this story
            </Heading>
          </DialogTitle>
          <DialogDescription asChild>
            <Text>
              This story, once featured, will appear on top of your blog.
            </Text>
          </DialogDescription>
          <Flex justify="end" gap="6" css={{ mt: '$6' }}>
            <DialogClose asChild>
              <Button size="lg" variant="ghost" disabled={featureLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              size="lg"
              color="orange"
              disabled={featureLoading}
              onClick={onConfirmFeature}
            >
              {featureLoading ? 'Processing ...' : 'Confirm'}
            </Button>
          </Flex>
        </DialogContent>
      </Dialog>

      <Dialog open={showUnFeatureDialog} onOpenChange={onCancelUnFeature}>
        <DialogContent>
          <DialogTitle asChild>
            <Heading as="h2" size="xl" css={{ mb: '$3' }}>
              Un-feature this story
            </Heading>
          </DialogTitle>
          <DialogDescription asChild>
            <>
              <Text>You’re about to un-feature this story.</Text>
              <Text>Would you like to continue?</Text>
            </>
          </DialogDescription>
          <Flex justify="end" gap="6" css={{ mt: '$6' }}>
            <DialogClose asChild>
              <Button size="lg" variant="ghost" disabled={unFeatureLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              size="lg"
              color="orange"
              disabled={unFeatureLoading}
              onClick={onConfirmUnFeature}
            >
              {unFeatureLoading ? 'Processing ...' : 'Confirm'}
            </Button>
          </Flex>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={onCancelDelete}>
        <DialogContent>
          <DialogTitle asChild>
            <Heading as="h2" size="xl" css={{ mb: '$3' }}>
              Delete my story
            </Heading>
          </DialogTitle>
          <DialogDescription asChild>
            <>
              <Text>You’re about to delete your story.</Text>
              <Text>Would you like to continue?</Text>
            </>
          </DialogDescription>
          <Flex justify="end" gap="6" css={{ mt: '$6' }}>
            <DialogClose asChild>
              <Button size="lg" variant="ghost" disabled={deleteLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              size="lg"
              color="orange"
              disabled={deleteLoading}
              onClick={onConfirmDelete}
            >
              {deleteLoading ? 'Deleting ...' : 'Confirm'}
            </Button>
          </Flex>
        </DialogContent>
      </Dialog>
    </React.Fragment>
  );
};
