import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MixerHorizontalIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { IconButton, Text } from '@radix-ui/themes';
import Image from 'next/legacy/image';
import { useState } from 'react';
import { RoundPlus } from '../../../icons';
import { styled } from '../../../stitches.config';
import { Box } from '../../../ui';

const ImgWrapper = styled('div', {
  maxWidth: 600,
  zIndex: -1,
  position: 'relative',
  mx: 'auto',
  boxShadow: '0 0 0 1px $colors$gray7',
  borderRadius: '$1',
  overflow: 'hidden',
});

export const HintsCarousel = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const nextSlide = () => {
    if (activeSlide === 3) {
      setActiveSlide(0);
      return;
    }
    setActiveSlide(activeSlide + 1);
  };

  const previousSlide = () => {
    if (activeSlide === 0) {
      setActiveSlide(3);
      return;
    }
    setActiveSlide(activeSlide - 1);
  };

  return (
    <section
      aria-label="hints carousel"
      className="text-center relative py-4 justify-between flex items-center gap-4"
    >
      <IconButton
        color="gray"
        variant="ghost"
        aria-label="previous slide"
        onClick={previousSlide}
      >
        <ArrowLeftIcon />
      </IconButton>

      <Box
        css={{
          display: 'grid',
          gridAutoRows: '1fr',
          width: '100%',
        }}
      >
        <Box
          aria-label="slide 4 of 4"
          aria-current={activeSlide === 0 ? 'true' : 'false'}
          css={{ display: activeSlide === 0 ? 'block' : 'none' }}
          className="space-y-4"
        >
          <Text color="gray">
            Highlight text to display the Bubble menu and change the formatting
          </Text>
          <ImgWrapper>
            <Image
              width={600}
              height={350}
              src="/static/img/hint4.gif"
              layout="responsive"
              objectFit="cover"
            />
          </ImgWrapper>
        </Box>
        <Box
          aria-label="slide 2 of 4"
          aria-current={activeSlide === 1 ? 'true' : 'false'}
          css={{ display: activeSlide === 1 ? 'block' : 'none' }}
          className="space-y-4"
        >
          <Text as="p" color="gray">
            Open a new paragraph and click on the{' '}
            <Box as="span" css={{ display: 'inline-block' }}>
              <RoundPlus />{' '}
            </Box>{' '}
            button to display the inline menu
          </Text>
          <ImgWrapper>
            <Image
              width={600}
              height={350}
              src="/static/img/hint2.gif"
              layout="responsive"
              objectFit="cover"
            />
          </ImgWrapper>
        </Box>
        <Box
          aria-label="slide 3 of 4"
          aria-current={activeSlide === 2 ? 'true' : 'false'}
          css={{ display: activeSlide === 2 ? 'block' : 'none' }}
          className="space-y-4"
        >
          <Text as="p" color="gray">
            You can use the slash command "/" to open the inline menu faster
          </Text>
          <ImgWrapper>
            <Image
              width={600}
              height={350}
              src="/static/img/hint3.gif"
              layout="responsive"
              objectFit="cover"
            />
          </ImgWrapper>
        </Box>

        <Box
          aria-label="slide 1 of 4"
          aria-current={activeSlide === 3 ? 'true' : 'false'}
          css={{ display: activeSlide === 3 ? 'block' : 'none' }}
          className="space-y-4"
        >
          <Text as="p" color="gray">
            Add and remove a cover image to your story by clicking on the{' '}
            <Box css={{ display: 'inline-block', px: '$1' }} as="span">
              <TrashIcon />
            </Box>
            button. you can change this image manually for sharing on social
            networks in the settings{' '}
            <Box css={{ display: 'inline-block', px: '$1' }} as="span">
              <MixerHorizontalIcon />
            </Box>
          </Text>
          <ImgWrapper>
            <Image
              width={600}
              height={350}
              src="/static/img/hint1.gif"
              layout="responsive"
              objectFit="cover"
            />
          </ImgWrapper>
        </Box>
      </Box>

      <IconButton
        color="gray"
        variant="ghost"
        aria-label="next slide"
        onClick={nextSlide}
      >
        <ArrowRightIcon />
      </IconButton>
    </section>
  );
};
