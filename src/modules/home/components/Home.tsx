import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import Link from 'next/link';
import { StoryItem } from '../';
import { SubsetStory, BlockstackUser } from '../../../types';
import {
  DashboardPageContainer,
  DashboardLayout,
} from '../../layout/components/DashboardLayout';
import { DashboardPageTitle } from '../../layout/components/DashboardHeader';
import { config } from '../../../config';

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
  @media (min-width: ${config.breakpoints.md}px) {
    height: 20rem;
  }
`;

const HelpCard = styled.a`
  ${tw`w-full relative rounded bg-grey-light`};
  transition: background-color 0.25s;
  &:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }
`;

const HelpCardImg = styled.img`
  ${tw`p-4 m-auto max-h-full`};
`;

const HelpCardCaption = styled.div`
  ${tw`absolute bottom-0 p-4 text-white w-full`};
  background: rgb(255, 255, 255);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(0, 0, 0, 0.6) 100%
  );
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

  return (
    <DashboardLayout>
      <DashboardPageContainer>
        <DashboardPageTitle
          title={
            selectedTab === 'published' ? 'Published stories' : 'Drafts stories'
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
                <HelpCard href="https://github.com/pradel/sigle/blob/master/CHANGELOG.md">
                  <HelpCardImg src="/static/img/work.png" />
                  <HelpCardCaption>
                    <HelpCardCaptionTitle>Documentation</HelpCardCaptionTitle>
                    <p>Step by step instructions</p>
                  </HelpCardCaption>
                </HelpCard>
              </HelpCardContainer>
              <HelpCardContainer>
                <HelpCard href="https://github.com/pradel/sigle/blob/master/CHANGELOG.md">
                  <HelpCardImg src="/static/img/data.png" />
                  <HelpCardCaption>
                    <HelpCardCaptionTitle>Changelog</HelpCardCaptionTitle>
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
          stories.map(story => (
            <StoryItem
              key={story.id}
              user={user}
              story={story}
              type={selectedTab === 'published' ? 'public' : 'private'}
              refetchStoriesLists={refetchStoriesLists}
            />
          ))}
      </DashboardPageContainer>
    </DashboardLayout>
  );
};
