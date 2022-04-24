import React from 'react';
import styled from 'styled-components';
import tw from 'twin.macro';
import Link from 'next/link';
import { StoryItem } from '../';
import { SubsetStory, BlockstackUser } from '../../../types';
import { DashboardPageTitle } from '../../layout/components/DashboardHeader';
import { sigleConfig } from '../../../config';
import { DashboardLayout } from '../../layout/components/DashboardLayout';

const IlluContainer = styled.div`
  ${tw`flex flex-col items-center justify-center mt-8`};
`;

const Illu = styled.img`
  ${tw`mb-4`};
  width: 250px;
  max-width: 100%;
`;

const HelpDivider = styled.div`
  ${tw`border-b border-solid border-grey w-full py-4`};
`;

const HelpText = styled.p`
  ${tw`mt-8`};
`;

const HelpContainer = styled.div`
  ${tw`flex flex-wrap -mx-4 mt-4`};
`;

const HelpCardContainer = styled.div`
  ${tw`w-1/2 md:w-1/3 xl:w-1/4 flex p-4 h-64`};
  @media (min-width: ${sigleConfig.breakpoints.md}px) {
    height: 20rem;
  }
`;

const HelpCard = styled.a`
  ${tw`w-full relative rounded bg-grey-light transition-colors duration-200`};
  &:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }
`;

const HelpCardImg = styled.img`
  ${tw`p-4 m-auto max-h-full`};
`;

const HelpCardCaption = styled.div`
  ${tw`absolute bottom-0 p-4 text-white w-full rounded-b`};
  background: rgba(0, 0, 0, 0.4);
`;

const HelpCardCaptionTitle = styled.h5`
  ${tw`font-bold mb-1`};
`;

interface Props {
  selectedTab: 'published' | 'drafts';
  user: BlockstackUser;
  stories: SubsetStory[] | null;
  loading: boolean;
  refetchStoriesLists: () => Promise<void>;
}

export const Home = ({
  selectedTab,
  user,
  stories,
  loading,
  refetchStoriesLists,
}: Props) => {
  const showIllu = !loading && (!stories || stories.length === 0);
  const nbStoriesLabel = loading ? '...' : stories ? stories.length : 0;

  return (
    <DashboardLayout>
      <DashboardPageTitle
        title={
          selectedTab === 'published'
            ? `Published stories (${nbStoriesLabel})`
            : `Drafts stories (${nbStoriesLabel})`
        }
      />

      {showIllu && (
        <React.Fragment>
          <IlluContainer>
            <Illu src="/static/img/three.png" alt="Three" />
            <p>Shoot the "new story" button to start.</p>
          </IlluContainer>
          <HelpDivider />
          <HelpText>A bit lost? We show you how to get started.</HelpText>
          <HelpContainer>
            <HelpCardContainer>
              <HelpCard href={sigleConfig.documentationUrl}>
                <HelpCardImg src="/static/img/work.png" />
                <HelpCardCaption>
                  <HelpCardCaptionTitle>Documentation</HelpCardCaptionTitle>
                  <p>Step by step instructions</p>
                </HelpCardCaption>
              </HelpCard>
            </HelpCardContainer>
            <HelpCardContainer>
              <HelpCard href="https://github.com/sigle/sigle/blob/main/CHANGELOG.md">
                <HelpCardImg src="/static/img/data.png" />
                <HelpCardCaption>
                  <HelpCardCaptionTitle>What's new?</HelpCardCaptionTitle>
                  <p>List product releases and changes</p>
                </HelpCardCaption>
              </HelpCard>
            </HelpCardContainer>
            <HelpCardContainer>
              <HelpCard href="https://app.sigle.io/sigleapp.id.blockstack">
                <HelpCardImg src="/static/img/albator.png" />
                <HelpCardCaption>
                  <HelpCardCaptionTitle>Blog</HelpCardCaptionTitle>
                  <p>Visit our blog to see the news</p>
                </HelpCardCaption>
              </HelpCard>
            </HelpCardContainer>
            <HelpCardContainer>
              <Link href="/help" passHref>
                <HelpCard>
                  <HelpCardImg src="/static/img/support.png" />
                  <HelpCardCaption>
                    <HelpCardCaptionTitle>Help</HelpCardCaptionTitle>
                    <p>Get in touch with us</p>
                  </HelpCardCaption>
                </HelpCard>
              </Link>
            </HelpCardContainer>
          </HelpContainer>
        </React.Fragment>
      )}

      {stories &&
        stories.map((story) => (
          <StoryItem
            key={story.id}
            user={user}
            story={story}
            type={selectedTab === 'published' ? 'public' : 'private'}
            refetchStoriesLists={refetchStoriesLists}
          />
        ))}
    </DashboardLayout>
  );
};
