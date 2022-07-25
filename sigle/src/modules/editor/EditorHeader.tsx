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
import { Typography } from '../../ui';

interface EditorHeaderProps {
  story: Story | false;
  loadingSave: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  onOpenSettings: () => void;
  onSave: () => void;
}

interface ScrollDirection {
  direction: 'up' | 'down' | null;
  prevOffset: number;
}

export const EditorHeader = ({
  story,
  loadingSave,
  onPublish,
  onUnpublish,
  onOpenSettings,
  onSave,
}: EditorHeaderProps) => {
  const [scroll, setScroll] = useState<ScrollDirection>({
    direction: null,
    prevOffset: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

  const handleScroll = () => {
    const scrollY = window.scrollY;
    if (scrollY === 0) {
      setScroll({ direction: null, prevOffset: scrollY });
    }
    if (scrollY > scroll.prevOffset) {
      setScroll({ direction: 'down', prevOffset: scrollY });
    } else if (scrollY < scroll.prevOffset) {
      setScroll({ direction: 'up', prevOffset: scrollY });
    }
  };

  return (
    <Flex
      css={{
        position: 'sticky',
        transform: scroll.direction === 'down' ? 'translateY(-100%)' : 'none',
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
          {story ? (
            <span>{story.type === 'public' ? ' | Published' : ' | Draft'}</span>
          ) : null}
        </Text>
        {story && story.type === 'public' && (
          <Button
            css={{ display: 'flex', alignItems: 'center', gap: '$2' }}
            variant="ghost"
            href={`/${user?.username}/${story.id}`}
            target="_blank"
            as="a"
          >
            <Typography size="subheading">See your story</Typography>
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
        {!loadingSave && story && story.type === 'public' && (
          <Button onClick={() => onSave()} variant="ghost">
            Save
          </Button>
        )}
        {!loadingSave && story && story.type === 'private' && (
          <Tippy
            content="Nobody can see it unless you click on « publish »"
            theme="light-border"
          >
            <Button onClick={() => onSave()} variant="ghost">
              Save
            </Button>
          </Tippy>
        )}
        {story && story.type === 'private' && (
          <Button onClick={onPublish} variant="ghost">
            Publish
          </Button>
        )}
        {story && story.type === 'public' && (
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
