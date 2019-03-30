import React from 'react';
import { Flex, Box } from 'rebass';
import { Button, Container, Heading, Link, Text } from '../components';

const Header = () => (
  <Container>
    <Flex py={3} color="black" alignItems="center">
      <img
        src="/static/images/logo.png"
        alt="Sigle logo"
        css={{
          height: 30,
        }}
      />
      <Box mx="auto" />
      <Link href="/a" py={2} px={3} color="black">
        Discover
      </Link>
      <Link href="/b" py={2} px={3} color="black">
        How to use?
      </Link>
      <Link href="/c" py={2} px={3} color="black">
        Contact
      </Link>
      <Button variant="primary">Sign in</Button>
    </Flex>
  </Container>
);

const story = {
  title: 'Why lorem ipsum?',
  content:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam quis accumsan arcu. Sed diam tellus, sollicitudin quis leo consequat, efficitur mattis ex. Sed sit amet volutpat ipsum, ut consequat mauris. Mauris tellus sapien, varius et vestibulum sit amet, accumsan vel diam. Mauris finibus nisi in cursus venenatis. Nulla varius faucibus ...',
};

const Story = () => (
  <Flex>
    <Box
      width={1 / 4}
      my={3}
      mr={3}
      css={{
        backgroundImage: 'url(https://source.unsplash.com/random/1024x768)',
        backgroundSize: 'cover',
      }}
    />
    <Box
      width={3 / 4}
      py={3}
      css={{
        borderBottom: 'solid 1px #e8e8e8',
      }}
    >
      <Heading fontSize={3}>{story.title}</Heading>
      <Text
        css={{
          color: '#494949',
        }}
        mt={1}
      >
        January 26, 2017
      </Text>
      <Text mt={2}>{story.content}</Text>
      <Text
        css={{
          color: '#494949',
        }}
        fontSize={1}
        mt={2}
      >
        Travel, lifestyle
      </Text>
      <Flex>
        <Button variant="outline" mt={1}>
          Read more
        </Button>
        <Box mx="auto" />
        <Text>John Doe</Text>
      </Flex>
    </Box>
  </Flex>
);

export const Discover = () => {
  return (
    <React.Fragment>
      <Header />
      <Container py={4}>
        <Heading>Discover the latest stories</Heading>
        <Box mt={3}>
          <Story />
          <Story />
        </Box>
      </Container>
    </React.Fragment>
  );
};
