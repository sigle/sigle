import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import Tippy from '@tippy.js/react';
import { IoIosEye } from 'react-icons/io';
import format from 'date-fns/format';
import { SubsetStory, BlockstackUser } from '../../../types';

const StoryContainer = styled.div`
  ${tw`py-8 border-b border-solid border-grey-light`};
`;

const StoryTitleContainer = styled.div`
  ${tw`flex`};
`;

const StoryTitleIcon = styled.div`
  ${tw`flex items-center text-grey-dark`};

  a {
    ${tw`flex text-black`};
  }
`;

const StoryTitle = styled.h3`
  ${tw`flex text-2xl font-bold no-underline text-black`};
`;

const StoryDate = styled.p`
  ${tw`mt-1 text-sm italic text-grey-dark`};
`;

const StoryText = styled.p`
  ${tw`mt-4 text-grey-dark`};
`;

interface Props {
  user: BlockstackUser;
  story: SubsetStory;
  type: 'public' | 'private';
}

export const StoryItem = ({ user, story, type }: Props) => {
  return (
    <StoryContainer>
      <StoryTitleContainer>
        <StoryTitle>
          <Link href="/stories/[storyId]" as={`/stories/${story.id}`} passHref>
            <a>{story.title}</a>
          </Link>
        </StoryTitle>
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
                href={`/${user.username}/${story.id}`}
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
      </StoryTitleContainer>

      <StoryDate>
        <Link href="/stories/[storyId]" as={`/stories/${story.id}`} passHref>
          <a>{format(story.createdAt, 'HH:mm dd MMMM yyyy')}</a>
        </Link>
      </StoryDate>
      <StoryText>
        <Link href="/stories/[storyId]" as={`/stories/${story.id}`} passHref>
          <a>{story.content}</a>
        </Link>
      </StoryText>
    </StoryContainer>
  );
};
