import { darkTheme, styled } from '../../stitches.config';

const StoryImageContainer = styled('span', {
  display: 'inline-block',
  position: 'relative',
  overflow: 'hidden',
  br: '$1',

  '&::before': {
    content: '',
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '$gray11',
    opacity: 0,
    transition: '.2s',

    [`.${darkTheme} &`]: {
      backgroundColor: '$colors$gray1',
    },
  },

  '&:hover::before': {
    opacity: 0.1,
  },

  variants: {
    featured: {
      true: {
        mb: '$4',
        borderRadius: '$3',

        '@md': {
          mb: '$5',
        },
      },
    },
  },
});

const StoryImage = styled('img', {
  objectFit: 'cover',
  objectPosition: 'center',
  width: 80,
  height: 58,
  zIndex: -1,
  position: 'relative',
  maxWidth: 'inherit',

  '@md': {
    width: 180,
    height: 130,
  },

  variants: {
    featured: {
      true: {
        width: 420,
        height: 214,

        '@md': {
          width: 826,
          height: 420,
        },
      },
    },
  },
});

interface StoryCardImageProps {
  featured?: boolean;
  image: string;
}

export const StoryCardImage = ({ featured, image }: StoryCardImageProps) => {
  return (
    <StoryImageContainer featured={featured}>
      <StoryImage
        featured={featured}
        data-testid="story-cover-image"
        src={image}
        loading="lazy"
      />
    </StoryImageContainer>
  );
};
