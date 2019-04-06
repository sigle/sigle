import React from 'react';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import { Container } from '../components';
import { Header } from '../modules/layout/components/Header';
import { Footer } from '../modules/layout/components/Footer';

const story = {
  title: 'Can coffee make you a better developer?',
  content:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis accumsan arcu. Sed diam tellus, sollicitudin quis leo consequat, efficitur mattis ex. Sed sit amet volutpat ipsum, ut consequat mauris. Mauris tellus sapien, varius et vestibulum sit amet ...',
};

const StoryContainer = styled.div`
  ${tw`w-full lg:flex py-4 border-b border-grey`};
`;

const StoryCover = styled.div`
  ${tw`h-48 lg:h-auto lg:w-64 flex-none bg-cover bg-center overflow-hidden mb-4 lg:mb-0 lg:mr-4`};
  background-image: url('https://source.unsplash.com/random/1024x768');
`;

const StoryContent = styled.div`
  ${tw`flex flex-col justify-between leading-normal`};
`;

const StoryTitle = styled.div`
  ${tw`text-xl font-medium`};
`;

const StoryDate = styled.div`
  ${tw`text-grey-darker mb-2 text-sm`};
`;

const StoryText = styled.div`
  ${tw`mb-2 lg:text-sm`};
`;

const StoryTags = styled.div`
  ${tw`text-grey-darker font-light text-sm italic`};
`;

const StoryProfile = styled.div`
  ${tw`flex items-center`};
`;

const StoryProfileImage = styled.img`
  ${tw`w-8 h-8 rounded-full mr-2`};
`;

const StoryProfileName = styled.div`
  ${tw`text-sm`};
`;

const Story = () => (
  <StoryContainer>
    <StoryCover />
    <StoryContent>
      <StoryTitle>{story.title}</StoryTitle>
      <StoryDate>January 26, 2017</StoryDate>
      <StoryText>{story.content}</StoryText>
      <StoryTags>Travel, lifestyle</StoryTags>
      <StoryProfile>
        <StoryProfileImage
          alt="Profile image of TODO"
          src="https://source.unsplash.com/random/100x100"
        />
        <StoryProfileName>John Doe</StoryProfileName>
      </StoryProfile>
    </StoryContent>
  </StoryContainer>
);

const DiscoverContainer = styled(Container)`
  ${tw`py-4`};
`;

const DiscoverTitle = styled.h1`
  ${tw`text-lg mb-4`};
`;

export const Discover = () => {
  return (
    <React.Fragment>
      <Header />
      <DiscoverContainer>
        <DiscoverTitle>Discover the latest stories</DiscoverTitle>

        <Story />
        <Story />
        <Story />
        <Story />
        <Story />
        <Story />
      </DiscoverContainer>
      <Footer />
    </React.Fragment>
  );
};
