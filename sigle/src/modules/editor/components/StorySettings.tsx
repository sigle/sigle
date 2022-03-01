import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Cross1Icon } from '@radix-ui/react-icons';
import { Story } from '../../../types';
import { StorySettingsForm } from './StorySettingsForm';
import { Dialog, DialogTitle, Heading, IconButton } from '../../../ui';
import { keyframes, styled } from '../../../stitches.config';

// const StyledDialogOverlay = styled(DialogOverlay)`
//   z-index: 11;
// `;

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translateX(100%)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
});

const StyledDialogContent = styled(DialogPrimitive.Content, {
  display: 'flex',
  flexDirection: 'column',
  transform: 'translateX(0)',
  maxWidth: '28rem',
  maxHeight: 'initial',
  overflow: 'hidden',
  width: '100%',
  backgroundColor: '$gray1',
  boxShadow: 'inset 1px 0 0 0 $colors$gray7',
  margin: 0,
  borderRadius: 0,
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${contentShow} 300ms ease-in-out`,
    willChange: 'translateX',
  },
});

const StyledCloseButton = styled(DialogPrimitive.Close, {
  position: 'absolute',
  top: '$9',
  right: '$6',
});

interface Props {
  story: Story;
  onSave: (storyParam?: Partial<Story>) => Promise<void>;
  open: boolean;
  onClose: () => void;
}

export const StorySettings = ({ open, onClose, story, onSave }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <StyledDialogContent aria-label="Story settings">
        <DialogTitle asChild>
          <Heading
            as="h2"
            size="lg"
            css={{ ml: '$8', mt: '$10', pb: '$4', fontWeight: 'normal' }}
          >
            Story settings
          </Heading>
        </DialogTitle>

        <StorySettingsForm story={story} onSave={onSave} />

        <StyledCloseButton asChild>
          <IconButton>
            <Cross1Icon width={15} height={15} />
          </IconButton>
        </StyledCloseButton>
      </StyledDialogContent>
    </Dialog>
  );
};
