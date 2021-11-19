import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Cross1Icon } from '@radix-ui/react-icons';
import { Story } from '../../../types';
import { StorySettingsForm } from './StorySettingsForm';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Heading,
  IconButton,
} from '../../../ui';
import { keyframes, styled } from '../../../stitches.config';

// const StyledDialogOverlay = styled(DialogOverlay)`
//   z-index: 11;
// `;

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translateX(100%)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
});

const StyledDialogContent = styled(DialogPrimitive.Content, {
  transform: 'translateX(0)',
  maxWidth: '28rem',
  maxHeight: 'initial',
  overflowY: 'auto',
  width: '100%',
  backgroundColor: 'white',
  margin: 0,
  padding: '1rem 2rem',
  borderRadius: 0,
  position: 'fixed',
  top: 0,
  right: 0,
  bottom: 0,
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1)`,
    willChange: 'translateX',
  },
});

const StyledCloseButton = styled(DialogPrimitive.Close, {
  position: 'absolute',
  top: '$4',
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
          <Heading as="h2" size="2xl" css={{ mt: '$5' }}>
            Settings
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
