import Link from 'next/link';
import {
  ArrowLeftIcon,
  EyeOpenIcon,
  MixerHorizontalIcon,
} from '@radix-ui/react-icons';
import Tippy from '@tippyjs/react';
import { Box, Button, Flex, IconButton, Text } from '../../ui';
import { Story } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { useEffect, useState } from 'react';

interface EditorHeaderProps {
  story: Story;
  loadingSave: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  onOpenSettings: () => void;
  onSave: () => void;
}

type ScrollDirection = 'up' | 'down' | null;

export const EditorHeader = ({
  story,
  loadingSave,
  onPublish,
  onUnpublish,
  onOpenSettings,
  onSave,
}: EditorHeaderProps) => {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
  const [prevOffset, setPrevOffset] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

  const handleScroll = () => {
    let scrollY = window.scrollY;
    if (scrollY === 0) {
      setScrollDirection(null);
    }
    if (scrollY > prevOffset) {
      setScrollDirection('down');
    } else if (scrollY < prevOffset) {
      setScrollDirection('up');
    }
    setPrevOffset(scrollY);
  };

  return (
    <Flex
      css={{
        position: 'sticky',
        transform: scrollDirection === 'down' ? 'translateY(-100%)' : 'none',
        transition: 'transform 0.5s, padding 0.2s',
        backgroundColor: '$gray1',
        top: window.scrollY < 40 ? 'auto' : 0,
        zIndex: 1,
        width: '100%',
        py: window.scrollY < 40 ? 0 : '$2',
        boxShadow: window.scrollY < 40 ? 'none' : '0 1px 0 0 $colors$gray6',
      }}
      as="header"
      justify="between"
      align="center"
    >
      <Flex gap="10" align="center">
        <Link href="/" passHref>
          <IconButton as="a" aria-label="Go back to the dashboard">
            <ArrowLeftIcon />
          </IconButton>
        </Link>
        <Text css={{ color: '$gray11' }} size="sm">
          <Box as="span" css={{ fontWeight: 'bold', fontSize: '$3' }}>
            {user?.username}
          </Box>
          <span>{story.type === 'public' ? ' | Published' : ' | Draft'}</span>
        </Text>
        {story.type === 'public' && (
          <Button
            css={{ display: 'flex', alignItems: 'center', gap: '$2' }}
            variant="ghost"
            href={`/${user?.username}/${story.id}`}
            target="_blank"
            as="a"
          >
            <Text size="action">See your story</Text>
            <EyeOpenIcon />
          </Button>
        )}
      </Flex>
      <Flex gap="10">
        {loadingSave && (
          <Button disabled variant="ghost">
            Saving ...
          </Button>
        )}
        {!loadingSave && story.type === 'public' && (
          <Button onClick={() => onSave()} variant="ghost">
            Save
          </Button>
        )}
        {!loadingSave && story.type === 'private' && (
          <Tippy
            content="Nobody can see it unless you click on « publish »"
            theme="light-border"
          >
            <Button onClick={() => onSave()} variant="ghost">
              Save
            </Button>
          </Tippy>
        )}
        {story.type === 'private' && (
          <Button onClick={onPublish} variant="ghost">
            Publish
          </Button>
        )}
        {story.type === 'public' && (
          <Button onClick={onUnpublish} variant="ghost">
            Unpublish
          </Button>
        )}
        <IconButton onClick={onOpenSettings} aria-label="Open settings">
          <MixerHorizontalIcon />
        </IconButton>
      </Flex>
    </Flex>
  );
};
