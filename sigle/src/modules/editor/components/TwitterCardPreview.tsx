import { Link2Icon } from '@radix-ui/react-icons';
import { styled } from '../../../stitches.config';
import { Flex, Box } from '../../../ui';
import { Story } from '../../../types';

const MetaContainer = styled('div', {
  borderColor: 'rgb(207, 217, 222)',
  borderRadius: '16px',
  borderWidth: '1px',
  borderStyle: 'solid',
  overflow: 'hidden',
  display: 'flex',

  variants: {
    image: {
      true: {
        display: 'block',
      },
    },
  },
});

const MetaTitle = styled('div', {
  color: 'rgb(15, 20, 25)',
  fontSize: '15px',
  lineHeight: '20px',
  overflowWrap: 'break-word',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const MetaDescription = styled('div', {
  color: 'rgb(83, 100, 113)',
  fontSize: '15px',
  lineHeight: '20px',
  overflowWrap: 'break-word',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const MetaLink = styled('div', {
  color: 'rgb(83, 100, 113)',
  fontSize: '15px',
  lineHeight: '20px',
  overflowWrap: 'break-word',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'flex',
  alignItems: 'center',
});

interface TwitterCardPreview {
  story: Story;
}

export const TwitterCardPreview = ({ story }: TwitterCardPreview) => {
  const seoTitle = story.metaTitle || `${story.title} | Sigle`;
  const seoDescription = story.metaDescription;
  const seoImage = story.coverImage;

  return (
    <MetaContainer image={!!seoImage}>
      {seoImage ? (
        <Box css={{ overflow: 'hidden', position: 'relative' }}>
          <Box css={{ paddingBottom: '52.356%' }} />
          <Box
            css={{
              height: '100%',
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
            }}
          >
            <Box
              css={{
                backgroundImage: `url(${seoImage})`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center center',
                backgroundColor: 'rgba(0, 0, 0, 0)',
                height: '100%',
                width: '100%',
              }}
            />
          </Box>
        </Box>
      ) : null}

      <Flex direction="column" css={{ gap: 2, padding: 12 }}>
        <MetaTitle>{seoTitle}</MetaTitle>
        <MetaDescription>{seoDescription}</MetaDescription>
        <MetaLink>
          <Link2Icon />
          <Box as="span" css={{ ml: 4 }}>
            sigle.io
          </Box>
        </MetaLink>
      </Flex>
    </MetaContainer>
  );
};
