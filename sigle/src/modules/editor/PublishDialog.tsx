import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { useGetUserSubscription } from '../../hooks/subscriptions';
import { styled } from '../../stitches.config';
import { Story } from '../../types';
import {
  Button,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Flex,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Typography,
} from '../../ui';
import { VisuallyHidden } from '../../ui/VisuallyHidden';
import { TwitterCardPreview } from './TwitterCardPreview';

const StyledTrigger = styled(TabsTrigger, {
  br: '$3',
  px: '$5',
  py: '$3',
  fontSize: '$2',
  lineHeight: '20.4px',
  color: '$gray9',
  boxShadow: '0 0 0 1px $colors$gray7',

  '&:hover': {
    color: '$gray11',
    boxShadow: '0 0 0 1px $colors$gray9',
  },

  '&:active': {
    color: '$gray11',
    backgroundColor: '$gray4',
    boxShadow: '0 0 0 1px $colors$gray9',
  },

  '&:disabled': {
    pointerEvents: 'none',
  },

  '&[data-state="active"]': {
    color: '$gray11',
    boxShadow: '0 0 0 1px $colors$gray11',

    '&:hover': {
      color: '$gray11',
      boxShadow: '0 0 0 1px $colors$gray11',
    },

    '&:active': {
      color: '$gray11',
      backgroundColor: 'transparent',
      boxShadow: '0 0 0 1px $colors$gray11',
    },
  },
});

const StyledDialogContent = styled(DialogContent, {
  maxWidth: '100%',
  maxHeight: '100%',
  width: '100vw',
  height: '100vh',
  pt: '$7',

  '@xl': {
    pt: '$10',
  },
});

interface PublishDialogProps {
  story: Story;
  open: boolean;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
  onEditPreview: () => void;
}

export const PublishDialog = ({
  story,
  open,
  loading,
  onConfirm,
  onClose,
  onEditPreview,
}: PublishDialogProps) => {
  const { data: userSubscription } = useGetUserSubscription();
  const [tabValue] = useState<'publish only' | 'publish and send'>(
    'publish only'
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <StyledDialogContent closeButton={false}>
        <Container>
          <VisuallyHidden>
            <DialogTitle>Preview and publish your story</DialogTitle>
          </VisuallyHidden>
          <Button
            onClick={onClose}
            variant="ghost"
            css={{ gap: '$2', ml: '-$1' }}
            size="sm"
          >
            <ArrowLeftIcon />
            Back to the editor
          </Button>
          <Flex
            direction={{
              '@initial': 'column',
              '@md': 'row',
            }}
            css={{
              mx: 'auto',
              mt: '$10',
              justifyContent: 'center',
              gap: '$10',
              maxWidth: 826,

              '@md': {
                mt: '$15',
              },
            }}
          >
            <Flex css={{ flex: 1 }} direction="column" gap="5">
              <Typography css={{ fontWeight: 700 }} as="h2" size="h1">
                Publication
              </Typography>
              <Tabs value={tabValue}>
                <TabsList
                  css={{
                    alignSelf: 'start',
                    flexDirection: 'row',
                  }}
                >
                  <StyledTrigger value="publish only">
                    Publish only
                  </StyledTrigger>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <div>
                        <StyledTrigger
                          disabled={!userSubscription}
                          value="publish and send"
                          css={{
                            textDecoration: userSubscription
                              ? 'none'
                              : 'line-through',
                          }}
                        >
                          Publish and send
                        </StyledTrigger>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={8}>
                      Coming Soon
                    </TooltipContent>
                  </Tooltip>
                </TabsList>
                <TabsContent
                  css={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '$5',
                  }}
                  value="publish only"
                >
                  <Typography css={{ fontWeight: 600 }} size="subheading">
                    You're in "Publish only" mode.
                  </Typography>
                </TabsContent>
              </Tabs>
            </Flex>

            <Flex css={{ flex: 1 }} direction="column" gap="5">
              <Flex justify="between">
                <Typography css={{ fontWeight: 700 }} as="h2" size="h1">
                  Preview
                </Typography>
                <Button
                  size="lg"
                  variant="ghost"
                  color="orange"
                  disabled={loading}
                  onClick={onEditPreview}
                >
                  Edit preview
                </Button>
              </Flex>
              <TwitterCardPreview story={story} />
              <Flex justify="end" gap="6" css={{ mt: '$5' }}>
                <Button
                  size="lg"
                  variant="ghost"
                  disabled={loading}
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  size="lg"
                  color="orange"
                  disabled={loading}
                  onClick={onConfirm}
                >
                  {loading ? 'Publishing ...' : 'Publish now'}
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Container>
      </StyledDialogContent>
    </Dialog>
  );
};
