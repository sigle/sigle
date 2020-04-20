import React from 'react';
import styled from 'styled-components';
import tw from 'twin.macro';
import { MdClose } from 'react-icons/md';
import { DialogContent, DialogOverlay } from '@reach/dialog';
import { animated, useTransition } from 'react-spring';
import { DropzoneRootProps, DropzoneInputProps } from 'react-dropzone';
import { Story } from '../../../types';
import { StorySettingsForm } from './StorySettingsForm';

const StyledDialogOverlay = styled(DialogOverlay)`
  z-index: 11;
`;

const StyledDialogContent = styled(DialogContent)`
  ${tw`fixed top-0 right-0 bottom-0 overflow-y-auto w-full max-w-md m-0 px-8 py-4 bg-white`};
`;

const TitleContainer = styled.div`
  ${tw`py-4 flex justify-between items-center`};
`;

const Title = styled.div`
  ${tw`text-2xl`};
`;

const CloseButton = styled.div`
  ${tw`p-2 -mr-2 flex items-center cursor-pointer`};
`;

interface Props {
  story: Story;
  open: boolean;
  onClose: () => void;
}

const AnimatedDialogOverlay = animated(StyledDialogOverlay);
const AnimatedDialogContent = animated(StyledDialogContent);

export const StorySettings = ({ open, onClose, story }: Props) => {
  const transitions = useTransition(open, null, {
    from: { opacity: 0, transform: 'translateX(100%)' },
    enter: { opacity: 1, transform: 'translateX(0)' },
    leave: { opacity: 0, transform: 'translateX(100%)' },
    config: {
      duration: 250,
    },
  });

  return (
    <React.Fragment>
      {transitions.map(
        ({ item, key, props: styles }) =>
          item && (
            <AnimatedDialogOverlay
              key={key}
              onDismiss={onClose}
              style={{ opacity: styles.opacity }}
            >
              <AnimatedDialogContent
                style={{
                  transform: styles.transform,
                }}
                aria-label="Story settings"
              >
                <TitleContainer>
                  <Title>Settings</Title>
                  <CloseButton onClick={onClose}>
                    <MdClose />
                  </CloseButton>
                </TitleContainer>

                <StorySettingsForm story={story} />
              </AnimatedDialogContent>
            </AnimatedDialogOverlay>
          )
      )}
    </React.Fragment>
  );
};
