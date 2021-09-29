import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import tw from 'twin.macro';
import { MdStar } from 'react-icons/md';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import format from 'date-fns/format';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
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
  Box,
} from '../../../ui';
import { SubsetStory, BlockstackUser } from '../../../types';
import { FullScreenDialog } from '../../../components';

const StoryContainer = styled.div`
  ${tw`py-4 lg:py-8 border-b border-solid border-grey lg:flex`};
`;

const StoryTitleContainer = styled.div`
  ${tw`flex`};
`;

const StarIcon = styled(MdStar)`
  ${tw`ml-2`};
  color: rgb(255, 199, 0);
`;

const StoryTitle = styled.h3`
  ${tw`flex text-xl no-underline text-black mr-3`};
`;

const StoryDate = styled.p`
  ${tw`mt-1 text-sm italic text-grey-dark`};
`;

const StoryText = styled.p`
  ${tw`mt-4 text-grey-dark`};
`;

const StoryImage = styled.div`
  ${tw`hidden xl:block bg-no-repeat bg-cover bg-center h-32 w-56 ml-8`};
`;

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
      <StoryContainer>
        <div style={{ flex: 1 }}>
          <StoryTitleContainer>
            <StoryTitle>
              <Link
                href="/stories/[storyId]"
                as={`/stories/${story.id}`}
                passHref
              >
                <a>{story.title}</a>
              </Link>
            </StoryTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Story settings">
                  <DotsHorizontalIcon width={22} height={22} />
                </button>
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
                <DropdownMenuItem onSelect={onEdit}>Edit</DropdownMenuItem>
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
                <DropdownMenuItem onSelect={onDelete}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {story.featured && <StarIcon size={22} />}
          </StoryTitleContainer>
          <StoryDate>
            <Link
              href="/stories/[storyId]"
              as={`/stories/${story.id}`}
              passHref
            >
              <a>{format(story.createdAt, 'HH:mm dd MMMM yyyy')}</a>
            </Link>
          </StoryDate>
          <StoryText>
            <Link
              href="/stories/[storyId]"
              as={`/stories/${story.id}`}
              passHref
            >
              <a>{story.content}</a>
            </Link>
          </StoryText>
        </div>
        {story.coverImage && (
          <div>
            <StoryImage
              style={{ backgroundImage: `url('${story.coverImage}')` }}
            />
          </div>
        )}
      </StoryContainer>

      <Dialog open={showFeatureDialog} onOpenChange={() => null}>
        <DialogContent>
          <DialogTitle asChild>
            <Heading as="h2" size="xl" css={{ mb: '$3' }}>
              Are you absolutely sure?
            </Heading>
          </DialogTitle>
          <DialogDescription asChild>
            <Text>
              This story, once featured, will appear on top of your blog.
            </Text>
          </DialogDescription>
          <Flex justify="end" gap="6" css={{ mt: '$6' }}>
            <DialogClose asChild>
              <Button size="lg">Cancel</Button>
            </DialogClose>
            <Button size="lg" color="orange">
              Yes, continue
            </Button>
          </Flex>
        </DialogContent>
      </Dialog>

      {/* <AlertDialog open={showFeatureDialog} onOpenChange={() => null}>
        <AlertDialogContent>
          <AlertDialogTitle asChild>
            <Heading as="h2" size="xl" css={{ mb: '$3' }}>
              Are you absolutely sure?
            </Heading>
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <Text>
              This story, once featured, will appear on top of your blog.
            </Text>
          </AlertDialogDescription>
          <Box css={{ display: 'flex', justifyContent: 'flex-end', mt: '$4' }}>
            <AlertDialogCancel asChild>
              <Button size="lg" css={{ mr: '$6' }}>
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button size="lg" color="orange">
                Yes, continue
              </Button>
            </AlertDialogAction>
          </Box>
        </AlertDialogContent>
      </AlertDialog> */}

      {/* <FullScreenDialog
        isOpen={showFeatureDialog}
        confirmLoading={featureLoading}
        onConfirm={onConfirmFeature}
        onCancel={onCancelFeature}
        loadingTitle="Processing ..."
        title="Feature this story"
        description={
          <React.Fragment>
            <p>This story, once featured, will appear on top of your blog.</p>
            <p>Would you like to continue?</p>
            <p>You can remove it at any time.</p>
          </React.Fragment>
        }
      /> */}

      <FullScreenDialog
        isOpen={showUnFeatureDialog}
        confirmLoading={unFeatureLoading}
        onConfirm={onConfirmUnFeature}
        onCancel={onCancelUnFeature}
        loadingTitle="Processing ..."
        title="Un-feature this story"
        description={
          <React.Fragment>
            <p>You’re about to un-feature this story.</p>
            <p>Would you like to continue?</p>
          </React.Fragment>
        }
      />

      <FullScreenDialog
        isOpen={showDeleteDialog}
        confirmLoading={deleteLoading}
        onConfirm={onConfirmDelete}
        onCancel={onCancelDelete}
        loadingTitle="Deleting ..."
        title="Delete my story"
        description={
          <React.Fragment>
            <p>You’re about to delete your story.</p>
            <p>Would you like to continue?</p>
          </React.Fragment>
        }
      />
    </React.Fragment>
  );
};
