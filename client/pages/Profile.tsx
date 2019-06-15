import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
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

export const Profile = () => {
  return (
    <React.Fragment>
      <Header />
      <ProfileContainer>
        <ProfileHeader>
          <ProfileImage
            src="https://source.unsplash.com/random/100x100"
            alt="TODO"
          />
          <div>
            <ProfileName>John Doe</ProfileName>
            <ProfileDescription>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis
              accumsan arcu.
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
      </ProfileContainer>
      <Footer />
    </React.Fragment>
  );
};

Profile.getInitialProps = ({ query }: any) => {
  const username = query.username;
  return { username };
};
