import { TbInfoCircle, TbTrash } from 'react-icons/tb';
import { keyframes, styled } from '@sigle/stitches.config';
import { Button, Flex, Input, Textarea, Typography } from '@sigle/ui';
import { useEditorStore } from '../store';
import { EditorSettingsModal } from './EditorSettingsModal';
import { MetaImage } from './MetaImage';

const StorySettingsRow = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
});

const IconLink = styled('a', {
  color: '$indigo11',
});

const canonicalUrlInfo =
  'https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls';

export const EditorSettings = () => {
  const menuOpen = useEditorStore((state) => state.menuOpen);
  const toggleMenu = useEditorStore((state) => state.toggleMenu);
  const story = useEditorStore((state) => state.story);
  const setStory = useEditorStore((state) => state.setStory);

  return (
    <EditorSettingsModal
      open={menuOpen}
      onOpenChange={() => toggleMenu(!menuOpen)}
    >
      <Typography size="lg" fontWeight="semiBold">
        Story settings
      </Typography>
      <Flex gap="5" direction="column" css={{ mt: '$8' }}>
        <StorySettingsRow>
          <Typography size="sm" fontWeight="semiBold">
            Publish date
          </Typography>
          <Input type="date" />
        </StorySettingsRow>
        <StorySettingsRow>
          <MetaImage />
        </StorySettingsRow>
        <StorySettingsRow>
          <Typography size="sm" fontWeight="semiBold">
            Meta title
          </Typography>
          <Input
            placeholder="Meta title"
            maxLength={100}
            value={story?.metaTitle || ''}
            onChange={(e) =>
              setStory({
                metaTitle: e.target.value,
              })
            }
          />
          <Typography size="xs" color="gray9">
            Recommended: 70 characters.
            <br />
            You have used {(story?.metaTitle || '').length} characters.
          </Typography>
        </StorySettingsRow>
        <StorySettingsRow>
          <Typography size="sm" fontWeight="semiBold">
            Meta description
          </Typography>
          <Textarea
            placeholder="Meta description"
            maxLength={250}
            rows={4}
            value={story?.metaDescription || ''}
            onChange={(e) =>
              setStory({
                metaDescription: e.target.value,
              })
            }
          />
          <Typography size="xs" color="gray9">
            Recommended: 156 characters.
            <br />
            You have used {(story?.metaDescription || '').length} characters.
          </Typography>
        </StorySettingsRow>
        <StorySettingsRow>
          <Typography size="sm" fontWeight="semiBold">
            Canonical URL
          </Typography>
          <Input
            placeholder="https://"
            maxLength={1000}
            value={story?.canonicalUrl || ''}
            onChange={(e) =>
              setStory({
                canonicalUrl: e.target.value,
              })
            }
          />
          <Flex gap="1">
            <Typography size="xs" color="gray9">
              Add a canonical URL
            </Typography>
            <IconLink href={canonicalUrlInfo} target="_blank" rel="noreferrer">
              <TbInfoCircle />
            </IconLink>
          </Flex>
        </StorySettingsRow>
        {/* TODO preview social */}
      </Flex>

      <Flex css={{ mt: '$8' }}>
        <Button rightIcon={<TbTrash />} variant="light" color="orange">
          Delete post
        </Button>
      </Flex>
    </EditorSettingsModal>
  );
};
