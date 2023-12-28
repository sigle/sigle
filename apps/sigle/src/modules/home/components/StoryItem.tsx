import React from 'react';
import Link from 'next/link';
import { StarFilledIcon } from '@radix-ui/react-icons';
import { Dialog, DropdownMenu, IconButton, Button } from '@radix-ui/themes';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import format from 'date-fns/format';
import { Heading, Text, Box, Flex } from '../../../ui';
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
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <IconButton variant="ghost" color="gray" size="1">
                        <DotsHorizontalIcon width={18} height={18} />
                      </IconButton>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content
                      align="end"
                      color="gray"
                      variant="soft"
                    >
                      {type === 'public' && (
                        <DropdownMenu.Item asChild>
                          <a
                            href={`/${user.username}/${story.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View my story
                          </a>
                        </DropdownMenu.Item>
                      )}
                      <DropdownMenu.Item onClick={onEdit}>
                        Edit
                      </DropdownMenu.Item>
                      {type === 'public' && (
                        <DropdownMenu.Item asChild>
                          <Link href={`/inscribe/${story.id}`}>Inscribe</Link>
                        </DropdownMenu.Item>
                      )}
                      {!story.featured && type === 'public' && (
                        <DropdownMenu.Item onClick={onFeature}>
                          Feature this story
                        </DropdownMenu.Item>
                      )}
                      {story.featured && type === 'public' && (
                        <DropdownMenu.Item onClick={onUnFeature}>
                          Un-feature this story
                        </DropdownMenu.Item>
                      )}
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item color="red" onClick={onDelete}>
                        Delete
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
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

      <Dialog.Root open={showFeatureDialog} onOpenChange={onCancelFeature}>
        <Dialog.Content size="3" className="max-w-[450px]">
          <Dialog.Title asChild>
            <Heading as="h2" size="xl" css={{ mb: '$3' }}>
              Feature this story
            </Heading>
          </Dialog.Title>
          <Dialog.Description>
            <Text>
              This story, once featured, will appear on top of your blog.
            </Text>
          </Dialog.Description>
          <Flex justify="end" gap="3" css={{ mt: '$4' }}>
            <Dialog.Close>
              <Button variant="soft" color="gray" disabled={featureLoading}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button disabled={featureLoading} onClick={onConfirmFeature}>
              {featureLoading ? 'Processing ...' : 'Confirm'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={showUnFeatureDialog} onOpenChange={onCancelUnFeature}>
        <Dialog.Content size="3" className="max-w-[450px]">
          <Dialog.Title asChild>
            <Heading as="h2" size="xl" css={{ mb: '$3' }}>
              Un-feature this story
            </Heading>
          </Dialog.Title>
          <Dialog.Description>
            <>
              <Text>You’re about to un-feature this story.</Text>
              <Text>Would you like to continue?</Text>
            </>
          </Dialog.Description>
          <Flex justify="end" gap="3" css={{ mt: '$4' }}>
            <Dialog.Close>
              <Button variant="soft" color="gray" disabled={unFeatureLoading}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button disabled={unFeatureLoading} onClick={onConfirmUnFeature}>
              {unFeatureLoading ? 'Processing ...' : 'Confirm'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={showDeleteDialog} onOpenChange={onCancelDelete}>
        <Dialog.Content size="3" className="max-w-[450px]">
          <Dialog.Title asChild>
            <Heading as="h2" size="xl" css={{ mb: '$3' }}>
              Delete my story
            </Heading>
          </Dialog.Title>
          <Dialog.Description>
            <>
              <Text>You’re about to delete your story.</Text>
              <Text>Would you like to continue?</Text>
            </>
          </Dialog.Description>
          <Flex justify="end" gap="3" css={{ mt: '$4' }}>
            <Dialog.Close>
              <Button variant="soft" color="gray" disabled={deleteLoading}>
                Cancel
              </Button>
            </Dialog.Close>
            <Button disabled={deleteLoading} onClick={onConfirmDelete}>
              {deleteLoading ? 'Deleting ...' : 'Confirm'}
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </React.Fragment>
  );
};
