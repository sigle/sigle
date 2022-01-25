import { EyeOpenIcon as EyeOpenIconBase } from '@radix-ui/react-icons';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { styled } from '../../../stitches.config';
import { Button, Container, Flex, Text } from '../../../ui';
import {
  convertStoryToSubsetStory,
  createNewEmptyStory,
  getStoriesFile,
  saveStoriesFile,
  saveStoryFile,
} from '../../../utils';
import * as Fathom from 'fathom-client';
import { useAuth } from '../../auth/AuthContext';
import { Goals } from '../../../utils/fathom';

const Header = styled('header', Container, {
  '@xs': {
    mt: '$4',
  },

  '@md': {
    mt: '$10',
  },

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

const Logo = () => (
  <Image
    priority
    width={101}
    height={45}
    objectFit="cover"
    src="/static/img/logo.png"
    alt="logo"
  />
);

const EyeOpenIcon = styled(EyeOpenIconBase, {
  display: 'inline-block',
});

const StatusDot = styled('div', {
  backgroundColor: '#37C391',
  width: '$2',
  height: '$2',
  borderRadius: '$round',
});

export const AppHeader = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loadingCreate, setLoadingCreate] = useState(false);

  const handleCreateNewPrivateStory = async () => {
    setLoadingCreate(true);
    try {
      const storiesFile = await getStoriesFile();
      const story = createNewEmptyStory();

      storiesFile.stories.unshift(convertStoryToSubsetStory(story));

      await saveStoriesFile(storiesFile);
      await saveStoryFile(story);

      Fathom.trackGoal(Goals.CREATE_NEW_STORY, 0);
      router.push('/stories/[storyId]', `/stories/${story.id}`);
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      setLoadingCreate(false);
    }
  };

  return (
    <Header>
      <Flex justify="center" gap="10" as="nav" align="center">
        <Link href="/" passHref>
          <a style={{ display: 'flex' }}>
            <Logo />
          </a>
        </Link>
        {user && (
          <Button
            css={{
              '@xs': {
                display: 'none',
              },
              '@xl': {
                display: 'block',
              },
            }}
            variant="ghost"
            href={`/${user.username}`}
            target="_blank"
            as="a"
          >
            <Text size="action" css={{ mr: '$2', display: 'inline-block' }}>
              Visit my blog
            </Text>
            <EyeOpenIcon />
          </Button>
        )}
      </Flex>
      {user && (
        <Flex
          css={{
            '@xs': {
              display: 'none',
            },
            '@xl': {
              display: 'flex',
            },
          }}
          align="center"
          gap="10"
        >
          <Flex gap="1" align="center">
            <StatusDot />
            <Text>{user.username}</Text>
          </Flex>
          {!loadingCreate && (
            <Button onClick={handleCreateNewPrivateStory} size="lg">
              Write a story
            </Button>
          )}
          {loadingCreate && (
            <Button disabled size="lg">
              Creating new story...
            </Button>
          )}
        </Flex>
      )}
    </Header>
  );
};
