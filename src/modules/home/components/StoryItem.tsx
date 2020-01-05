import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import Tippy from '@tippy.js/react';
import { IoIosEye } from 'react-icons/io';
import format from 'date-fns/format';
import { ButtonOutline } from '../../../components';
import { SubsetStory, BlockstackUser } from '../../../types';

const StoryContainer = styled.div`
  ${tw`py-8 border-b border-solid border-grey-light`};
`;

const StoryTitleContainer = styled.div`
  ${tw`flex justify-between`};
`;

const StoryTitleContainerLeft = styled.div`
  ${tw`flex`};
`;

const StoryTitleIcon = styled.div`
  ${tw`flex items-center text-grey-dark`};

  a {
    ${tw`flex text-black`};
  }
`;

const StoryTitle = styled.div`
  ${tw`flex text-2xl font-bold no-underline text-black cursor-pointer`};
`;

const StoryDate = styled.div`
  ${tw`mt-1 text-sm italic text-grey-dark`};
`;

const StoryText = styled.div`
  ${tw`mt-4 text-grey-dark`};
`;

interface Props {
  user: BlockstackUser;
  story: SubsetStory;
  type: 'public' | 'private';
  loading: boolean;
  onPublish: () => void;
  onUnPublish: () => void;
}

export const StoryItem = ({
  user,
  story,
  type,
  loading,
  onPublish,
  onUnPublish,
}: Props) => {
  return (
    <StoryContainer>
      <StoryTitleContainer>
        <StoryTitleContainerLeft>
          <Link
            href="/stories/[storyId]"
            as={`/stories/${story.slug ? story.slug : story.id}`}
          >
            <StoryTitle as="a">{story.title}</StoryTitle>
          </Link>
          <Tippy
            content={
              type === 'public'
                ? 'View my story'
                : 'You need to publish your article to view it'
            }
            theme="light-border"
          >
            <StoryTitleIcon>
              {type === 'public' ? (
                <a
                  href={`/${user.username}/${
                    story.slug ? story.slug : story.id
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IoIosEye size={22} style={{ marginLeft: 6 }} />
                </a>
              ) : (
                <IoIosEye size={22} style={{ marginLeft: 6 }} />
              )}
            </StoryTitleIcon>
          </Tippy>
        </StoryTitleContainerLeft>

        <div>
          {loading && (
            <ButtonOutline style={{ marginRight: 8 }} disabled={true}>
              Loading ...
            </ButtonOutline>
          )}
          {!loading && type === 'private' && (
            <ButtonOutline style={{ marginRight: 8 }} onClick={onPublish}>
              Publish
            </ButtonOutline>
          )}
          {!loading && type === 'public' && (
            <ButtonOutline style={{ marginRight: 8 }} onClick={onUnPublish}>
              Unpublish
            </ButtonOutline>
          )}
          <Link
            href="/stories/[storyId]"
            as={`/stories/${story.slug ? story.slug : story.id}`}
          >
            <ButtonOutline as="a">Edit</ButtonOutline>
          </Link>
        </div>
      </StoryTitleContainer>

      <StoryDate>{format(story.createdAt, 'HH:mm dd MMMM yyyy')}</StoryDate>
      <StoryText>{story.content}</StoryText>
    </StoryContainer>
  );
};
