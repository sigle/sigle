import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import tw from 'twin.macro';
import { MdMoreHoriz, MdStar } from 'react-icons/md';
import format from 'date-fns/format';
import {
  Menu,
  MenuList,
  MenuButton,
  MenuItem,
  MenuLink,
} from '@reach/menu-button';
import { SubsetStory, BlockstackUser } from '../../../types';
import { FullScreenDialog } from '../../../components';

const StoryContainer = styled.div`
  ${tw`py-4 lg:py-8 border-b border-solid border-grey lg:flex`};
`;

const StoryTitleContainer = styled.div`
  ${tw`flex`};
`;

const StoryTitleIcon = styled(MdMoreHoriz)`
  ${tw`text-grey-darker`};
`;

const StarIcon = styled(MdStar)`
  ${tw`text-yellow-400 ml-2`};
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
            <Menu>
              <MenuButton>
                <StoryTitleIcon size={22} />
              </MenuButton>
              <MenuList>
                {type === 'public' && (
                  <MenuLink
                    as="a"
                    href={`/${user.username}/${story.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View my story
                  </MenuLink>
                )}
                <MenuItem onSelect={onEdit}>Edit</MenuItem>
                {!story.featured && type === 'public' && (
                  <MenuItem onSelect={onFeature}>Feature this story</MenuItem>
                )}
                {story.featured && type === 'public' && (
                  <MenuItem onSelect={onUnFeature}>
                    Un-feature this story
                  </MenuItem>
                )}
                <MenuItem onSelect={onDelete}>Delete</MenuItem>
              </MenuList>
            </Menu>
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

      <FullScreenDialog
        isOpen={showFeatureDialog}
        confirmLoading={featureLoading}
        onConfirm={onConfirmFeature}
        onCancel={onCancelFeature}
        loadingTitle="Processing ..."
        title="Feature my story"
        description={
          <React.Fragment>
            <p>You’re about to feature this story.</p>
            <p>Would you like to continue?</p>
          </React.Fragment>
        }
      />

      <FullScreenDialog
        isOpen={showUnFeatureDialog}
        confirmLoading={unFeatureLoading}
        onConfirm={onConfirmUnFeature}
        onCancel={onCancelUnFeature}
        loadingTitle="Processing ..."
        title="Un-feature my story"
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
