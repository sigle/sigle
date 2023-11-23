import Link from 'next/link';
import {
  ArrowLeftIcon,
  EyeOpenIcon,
  MixerHorizontalIcon,
} from '@radix-ui/react-icons';
import Tippy from '@tippyjs/react';
import { Box, Button, Flex, IconButton, Typography } from '../../ui';
import { Story } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { useEffect, useState } from 'react';

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
        transform:
          scroll.direction === 'down' && scroll.prevOffset > 0
            ? 'translateY(-100%)'
            : 'none',
        transition: 'transform 0.5s, padding 0.2s',
        backgroundColor: '$gray1',
        top: window.scrollY < 40 ? 'auto' : 0,
        zIndex: 1,
        mx: '-$5',
        px: '$5',
        py: window.scrollY < 40 ? 0 : '$2',
        boxShadow: window.scrollY < 40 ? 'none' : '0 1px 0 0 $colors$gray6',
      }}
      as="header"
      justify="between"
      align="center"
    >
      <Flex gap={{ '@initial': '5', '@md': '10' }} align="center">
        <Link href="/" passHref legacyBehavior>
          <IconButton size="sm" as="a" aria-label="Go back to the dashboard">
            <ArrowLeftIcon />
          </IconButton>
        </Link>
        <Typography css={{ color: '$gray11' }} size="subheading">
          <Box
            as="span"
            css={{
              fontWeight: 'bold',
              fontSize: '$3',
              display: 'none',
              '@md': { display: 'inline' },
            }}
          >
            {user?.username}
            <Box as="span" css={{ fontWeight: 400 }}>
              {' '}
              |{' '}
            </Box>
          </Box>
          {story ? (
            <span>{story.type === 'public' ? 'Published' : 'Draft'}</span>
          ) : null}
        </Typography>
        {story && story.type === 'public' && (
          <>
            <Button
              size="sm"
              css={{
                display: 'none',
                alignItems: 'center',
                gap: '$2',
                '@md': { display: 'flex' },
              }}
              variant="ghost"
              href={`/${user?.username}/${story.id}`}
              target="_blank"
              as="a"
            >
              See your story
              <EyeOpenIcon />
            </Button>

            <IconButton
              size="sm"
              href={`/${user?.username}/${story.id}`}
              target="_blank"
              as="a"
              css={{ display: 'inline', '@md': { display: 'none' } }}
            >
              <EyeOpenIcon />
            </IconButton>
          </>
        )}
      </Flex>
      <Flex gap={{ '@initial': '5', '@md': '10' }}>
        {loadingSave && (
          <Button size="sm" disabled variant="ghost">
            Saving ...
          </Button>
        )}
        {!loadingSave && story && story.type === 'public' && (
          <Button size="sm" onClick={() => onSave()} variant="ghost">
            Save
          </Button>
        )}
        {!loadingSave && story && story.type === 'private' && (
          <Tippy
            content="Nobody can see it unless you click on « publish »"
            theme="light-border"
          >
            <Button size="sm" onClick={() => onSave()} variant="ghost">
              Save
            </Button>
          </Tippy>
        )}
        {story && story.type === 'private' && (
          <Button size="sm" onClick={onPublish} variant="ghost">
            Publish
          </Button>
        )}
        {story && story.type === 'public' && (
          <Button size="sm" onClick={onUnpublish} variant="ghost">
            Unpublish
          </Button>
        )}
        <IconButton
          size="sm"
          onClick={onOpenSettings}
          aria-label="Open settings"
        >
          <MixerHorizontalIcon />
        </IconButton>
      </Flex>
    </Flex>
  );
};
