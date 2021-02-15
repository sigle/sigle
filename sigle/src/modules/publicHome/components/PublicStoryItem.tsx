import React from 'react';
import Link from 'next/link';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';
import format from 'date-fns/format';
import { SubsetStory, SettingsFile } from '../../../types';
import { sigleConfig } from '../../../config';
import { sanitizeHexColor } from '../../../utils/security';

const Container = styled.div`
  ${tw`py-8 border-b border-solid border-grey-light`};
`;

const StoryContainer = styled.div<{ siteColor?: string; featured?: boolean }>`
  ${tw`cursor-pointer`};

  ${(props) =>
    !props.featured &&
    css`
      @media (min-width: ${sigleConfig.breakpoints.md}px) {
        ${tw`flex`};
      }
    `}

  ${(props) =>
    props.featured &&
    css`
      @media (min-width: ${sigleConfig.breakpoints.xl}px) {
        ${tw`-ml-20 -mr-20`};
      }
    `}

   

  &:hover .sigle-story-title {
    ${({ siteColor }) => (siteColor ? `color: ${siteColor}` : tw`text-pink`)}
  }
`;

const StoryContainerImage = styled.div<{ featured?: boolean }>`
  ${tw`mb-4`};

  ${(props) =>
    !props.featured &&
    css`
      @media (min-width: ${sigleConfig.breakpoints.md}px) {
        ${tw`w-1/3 mb-0`};
      }
    `}
`;

const StoryImage = styled.img`
  display: block;
  max-width: 100%;
`;

const StoryContainerContent = styled.div<{
  hasCover: boolean;
  featured?: boolean;
}>`
  ${(props) =>
    props.hasCover &&
    !props.featured &&
    css`
      @media (min-width: ${sigleConfig.breakpoints.md}px) {
        ${tw`w-2/3 pl-4`};
      }
    `}
`;

const StoryTitle = styled.div`
  ${tw`text-2xl font-bold no-underline text-black transition-colors duration-200 ease-in-out`};
`;

const StoryDate = styled.div`
  ${tw`mt-1 text-sm text-grey-dark`};
`;

const StoryText = styled.div`
  ${tw`mt-4 text-grey-darker leading-tight`};
`;

interface Props {
  username: string;
  story: SubsetStory;
  settings: SettingsFile;
}

export const PublicStoryItem = ({ username, story, settings }: Props) => {
  const safeSiteColor =
    settings.siteColor && sanitizeHexColor(settings.siteColor);

  return (
    <Container>
      <Link href="/[username]/[storyId]" as={`/${username}/${story.id}`}>
        <StoryContainer siteColor={safeSiteColor} featured={story.featured}>
          {story.coverImage && (
            <StoryContainerImage featured={story.featured}>
              <StoryImage
                data-testid="story-cover-image"
                className="sigle-story-cover-image"
                src={story.coverImage}
              />
            </StoryContainerImage>
          )}
          <StoryContainerContent
            hasCover={!!story.coverImage}
            featured={story.featured}
          >
            <StoryTitle data-testid="story-title" className="sigle-story-title">
              {story.title}
            </StoryTitle>
            <StoryDate data-testid="story-date" className="sigle-story-date">
              {format(story.createdAt, 'dd MMMM yyyy')}
            </StoryDate>
            <StoryText
              data-testid="story-content"
              className="sigle-story-content"
            >
              {story.content}
            </StoryText>
          </StoryContainerContent>
        </StoryContainer>
      </Link>
    </Container>
  );
};
