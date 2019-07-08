import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { graphql } from 'react-relay';
import Error from 'next/error';
import {
  FullHeightContainer,
  MinHeightContainer,
  Container,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
} from '../components';
import { Header } from '../modules/layout/components/Header';
import { Footer } from '../modules/layout/components/Footer';
import { withData } from '../lib/withData';
import { ProfileUserQueryResponse } from './__generated__/ProfileUserQuery.graphql';
import { PublicStoryItem } from '../modules/publicStories/components/PublicStoryItem';

const ProfileContainer = styled(Container)`
  ${tw`py-6`};
`;

const ProfileImage = styled.img`
  ${tw`w-32 h-32 rounded-full mb-2 lg:mb-0 lg:mr-4`};
`;

const ProfileName = styled.h2`
  ${tw`text-2xl font-bold`};
`;

const ProfileUsername = styled.p`
  ${tw`text-sm text-grey-darker`};
`;

const ProfileDescription = styled.p`
  ${tw`lg:text-sm`};
`;

const ProfileHeader = styled.div`
  ${tw`lg:flex lg:items-center mb-8`};
`;

interface Props extends ProfileUserQueryResponse {
  username: string;
}

const ProfileComponent = ({ user, publicStories }: Props) => {
  if (!user) {
    // TODO nice 404 page
    return <Error title="Page not found" statusCode={404} />;
  }

  if (!publicStories) {
    // TODO return error 500
    return null;
  }

  return (
    <FullHeightContainer>
      <Header />
      <MinHeightContainer>
        <ProfileContainer>
          <React.Fragment>
            <ProfileHeader>
              <ProfileImage
                src={user.imageUrl!}
                alt={`Profile image of ${user.name || user.username}`}
              />
              <div>
                <ProfileName>{user.name}</ProfileName>
                <ProfileUsername>{user.username}</ProfileUsername>
                <ProfileDescription>{user.description}</ProfileDescription>
              </div>
            </ProfileHeader>

            <Tabs>
              <TabList>
                <Tab>Published articles ({publicStories.totalCount})</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  {publicStories.edges &&
                    publicStories.edges.map(data => (
                      <PublicStoryItem
                        key={data!.node!.id}
                        story={data!.node!}
                      />
                    ))}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </React.Fragment>
        </ProfileContainer>
        <Footer />
      </MinHeightContainer>
    </FullHeightContainer>
  );
};

ProfileComponent.getInitialProps = ({
  query,
}: {
  query: { username: string };
}) => {
  const { username } = query;
  return { relayVariables: { username } };
};

export const Profile = withData(ProfileComponent, {
  query: graphql`
    query ProfileUserQuery($username: String!) {
      user(username: $username) {
        id
        username
        name
        description
        imageUrl(size: 128)
      }
      publicStories {
        totalCount
        edges {
          node {
            id
            ...PublicStoryItem_story
          }
        }
      }
    }
  `,
});
