import { styled } from '../../stitches.config';
import { Flex, Box } from '../../ui';
import { Story } from '../../types';

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
  color: '$gray11',
  fontSize: '15px',
  lineHeight: '20px',
  overflowWrap: 'break-word',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const MetaDescription = styled('div', {
  color: '$gray10',
  fontSize: '13px',
  lineHeight: '16px',
  overflowWrap: 'break-word',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

const MetaLink = styled('div', {
  color: '$gray9',
  fontSize: '13px',
  lineHeight: '16px',
  overflowWrap: 'break-word',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: 'flex',
  alignItems: 'center',
});

interface TwitterCardPreviewProps {
  story: Story;
}

export const TwitterCardPreview = ({ story }: TwitterCardPreviewProps) => {
  const seoTitle = story.metaTitle || `${story.title} | Sigle`;
  const seoDescription = story.metaDescription;
  const seoImage = story.metaImage || story.coverImage;

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
                backgroundImage: `url("${seoImage}")`,
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
      ) : (
        <Box
          css={{
            position: 'relative',
            borderColor: 'rgb(207, 217, 222)',
            borderRightWidth: '1px',
            borderStyle: 'solid',
          }}
        >
          <Box
            css={{
              overflow: 'hidden',
              backgroundColor: 'rgb(247, 249, 249)',
              width: 130,
            }}
          >
            <Box css={{ paddingBottom: '100%', width: '100%' }} />
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
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  style={{ height: '2em', fill: 'rgb(83, 100, 113)' }}
                >
                  <path d="M14 11.25H6a.75.75 0 000 1.5h8a.75.75 0 000-1.5zm0-4H6a.75.75 0 000 1.5h8a.75.75 0 000-1.5zm-3.25 8H6a.75.75 0 000 1.5h4.75a.75.75 0 000-1.5z" />
                  <path d="M21.5 11.25h-3.25v-7C18.25 3.01 17.24 2 16 2H4C2.76 2 1.75 3.01 1.75 4.25v15.5C1.75 20.99 2.76 22 4 22h15.5a2.752 2.752 0 002.75-2.75V12a.75.75 0 00-.75-.75zm-18.25 8.5V4.25c0-.413.337-.75.75-.75h12c.413 0 .75.337.75.75v15c0 .452.12.873.315 1.25H4a.752.752 0 01-.75-.75zm16.25.75c-.69 0-1.25-.56-1.25-1.25v-6.5h2.5v6.5c0 .69-.56 1.25-1.25 1.25z" />
                </svg>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <Flex
        direction="column"
        css={{ gap: 2, p: '$2', justifyContent: 'center', width: '100%' }}
      >
        <MetaLink>app.sigle.io</MetaLink>
        <MetaTitle>{seoTitle}</MetaTitle>
        <MetaDescription>{seoDescription}</MetaDescription>
      </Flex>
    </MetaContainer>
  );
};
