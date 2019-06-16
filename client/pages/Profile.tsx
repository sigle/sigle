import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { graphql, QueryRenderer } from 'react-relay';
import {
  Container,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
} from '../components';
import { Header } from '../modules/layout/components/Header';
import { Footer } from '../modules/layout/components/Footer';
import { Story } from './Discover';
import { environment } from '../utils/relay';

const ProfileContainer = styled(Container)`
  ${tw`py-6`};
`;

const ProfileImage = styled.img`
  ${tw`w-32 h-32 rounded-full mb-2 lg:mb-0 lg:mr-4`};
`;

const ProfileName = styled.h2`
  ${tw`text-2xl font-bold`};
`;

const ProfileDescription = styled.p`
  ${tw`lg:text-sm`};
`;

const ProfileHeader = styled.div`
  ${tw`lg:flex lg:items-center mb-8`};
`;

interface Props {
  username: string;
}

export const Profile = ({ username }: Props) => {
  return (
    <React.Fragment>
      <Header />
      <ProfileContainer>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ProfileUserQuery($username: String!) {
              user(username: $username) {
                id
                username
                name
                description
                imageUrl(size: 128)
              }
            }
          `}
          variables={{ username }}
          render={({ error, props }) => {
            if (error) {
              return <div>Error!</div>;
            }
            if (!props) {
              return <div>Loading...</div>;
            }
            return (
              <React.Fragment>
                <ProfileHeader>
                  <ProfileImage
                    src={props.user.imageUrl}
                    alt={`Profile image of ${props.user.name ||
                      props.user.username}`}
                  />
                  <div>
                    <ProfileName>
                      {props.user.name || props.user.username}
                    </ProfileName>
                    <ProfileDescription>
                      {props.user.description}
                    </ProfileDescription>
                  </div>
                </ProfileHeader>

                <Tabs>
                  <TabList>
                    <Tab>Published articles (5)</Tab>
                  </TabList>
                  <TabPanels>
                    <TabPanel>
                      <Story />
                      <Story />
                      <Story />
                      <Story />
                      <Story />
                      <Story />
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </React.Fragment>
            );
          }}
        />
      </ProfileContainer>
      <Footer />
    </React.Fragment>
  );
};

Profile.getInitialProps = ({ query }: any) => {
  const username = query.username;
  return { username };
};
