import { IconButton } from '@radix-ui/themes';
import { useState } from 'react';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { CarouselItem } from './carousel-item';

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

  const hints = [
    {
      description:
        'Highlight text to display the Bubble menu and change the formatting',
      image: '/static/img/hint4.gif',
    },
    {
      description:
        'Open a new paragraph and click on the + button to display the inline menu',
      image: '/static/img/hint2.gif',
    },
    {
      description:
        'You can use the slash command "/" to open the inline menu faster',
      image: '/static/img/hint3.gif',
    },
    {
      description:
        'Add and remove a cover image to your story by clicking on the trash button. you can change this image manually for sharing on social networks in the settings',
      image: '/static/img/hint1.gif',
    },
  ];

  return (
    <section
      aria-label="hints carousel"
      className="relative flex items-center justify-between gap-4 py-4 text-center"
    >
      <IconButton
        color="gray"
        variant="ghost"
        aria-label="previous slide"
        onClick={previousSlide}
      >
        <IconArrowLeft size={20} />
      </IconButton>

      <div className="grid grid-rows-1 gap-4">
        {hints.map((hint, index) => (
          <CarouselItem key={index} {...hint} active={activeSlide === index} />
        ))}
      </div>

      <IconButton
        color="gray"
        variant="ghost"
        aria-label="next slide"
        onClick={nextSlide}
      >
        <IconArrowRight size={20} />
      </IconButton>
    </section>
  );
};
