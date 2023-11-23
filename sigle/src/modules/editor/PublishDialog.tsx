import { ArrowLeftIcon, CheckCircledIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { styled } from '../../stitches.config';
import { Story } from '../../types';
import {
  Box,
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
  Typography,
} from '../../ui';
import { VisuallyHidden } from '../../ui/VisuallyHidden';
import { PublishAndSendDialog } from './PublishAndSendDialog';
import { SendTestEmail } from './PublishDialog/SendTestEmail';
import { TwitterCardPreview } from './TwitterCardPreview';
import {
  useUserControllerGetUserMe,
  useSubscriptionControllerGetUserMe,
  useStoriesControllerGet,
} from '@/__generated__/sigle-api';

const StyledTabsTrigger = styled(TabsTrigger, {
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
  animationDuration: '400ms',

  '@xl': {
    pt: '$10',
  },
});

interface PublishDialogProps {
  story: Story;
  open: boolean;
  loading: boolean;
  onConfirm: (options?: { send?: boolean }) => Promise<void>;
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
  const { data: userMe } = useUserControllerGetUserMe({});
  const { data: userSubscription } = useSubscriptionControllerGetUserMe({});
  const { data: storyApi, refetch: refetchStoryApi } = useStoriesControllerGet({
    pathParams: {
      storyId: story.id,
    },
  });
  const [tabValue, setTabValue] = useState<'publish only' | 'publish and send'>(
    'publish only',
  );
  const [showPublishAndSendDialog, setShowPublishAndSendDialog] =
    useState(false);

  useEffect(() => {
    if (storyApi && storyApi.email) {
      setTabValue('publish only');
    }
  }, [storyApi]);

  const handleShowPublishAndSendDialog = () =>
    setShowPublishAndSendDialog(true);

  const handleCancelPublishAndSendDialog = () =>
    setShowPublishAndSendDialog(false);

  const handleConfirmPublishAndSendDialog = async () => {
    await onConfirm({ send: true });
    setShowPublishAndSendDialog(false);
    await refetchStoryApi();
  };

  const hasActiveSubscription = !!userSubscription;
  const isNewsletterActive = userMe?.newsletter?.status === 'ACTIVE';
  const isStoryAlreadySent = !!storyApi?.email;

  return (
    <>
      <Dialog open={open} onOpenChange={onClose} overlay={false}>
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
                <Tabs
                  value={tabValue}
                  onValueChange={(value) => setTabValue(value as any)}
                >
                  <TabsList
                    css={{
                      alignSelf: 'start',
                      flexDirection: isNewsletterActive ? 'row-reverse' : 'row',
                    }}
                  >
                    <StyledTabsTrigger value="publish only">
                      Publish only
                    </StyledTabsTrigger>
                    {(isStoryAlreadySent || !hasActiveSubscription) && (
                      <StyledTabsTrigger
                        disabled
                        value="publish and send"
                        css={{
                          textDecoration: 'line-through',
                        }}
                      >
                        Publish and send
                      </StyledTabsTrigger>
                    )}
                    {!isStoryAlreadySent && hasActiveSubscription && (
                      <StyledTabsTrigger value="publish and send">
                        Publish and send
                      </StyledTabsTrigger>
                    )}
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
                      {isStoryAlreadySent
                        ? 'You are in “Publish only” mode because you already sent this newsletter to your subscribers.'
                        : 'You\'re in "Publish only" mode.'}
                    </Typography>
                    {(!hasActiveSubscription || !isNewsletterActive) && (
                      <div>
                        <Typography size="subheading">
                          Start sending emails today:
                        </Typography>
                        <Typography size="subheading" css={{ mt: '$3' }}>
                          1 - Upgrade to the Creator+ plan
                          {hasActiveSubscription && (
                            <Box
                              as="span"
                              css={{
                                color: '$green11',
                                display: 'inline-block',
                                ml: '$2',
                              }}
                            >
                              <CheckCircledIcon />
                            </Box>
                          )}
                        </Typography>
                        {!hasActiveSubscription && (
                          <Link href="/settings/plans" target="_blank">
                            <Button variant="subtle" css={{ mt: '$2' }}>
                              Upgrade
                            </Button>
                          </Link>
                        )}

                        <Typography size="subheading" css={{ mt: '$3' }}>
                          2 - Activate the newsletter feature
                        </Typography>
                        {!isNewsletterActive && (
                          <Link href="/settings/newsletter" target="_blank">
                            <Button variant="subtle" css={{ mt: '$2' }}>
                              Activate
                            </Button>
                          </Link>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent
                    css={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '$5',
                    }}
                    value="publish and send"
                  >
                    {!isStoryAlreadySent &&
                      hasActiveSubscription &&
                      isNewsletterActive && <SendTestEmail story={story} />}
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
                  {tabValue === 'publish only' ? (
                    <Button
                      size="lg"
                      color="orange"
                      disabled={loading}
                      onClick={() => onConfirm()}
                    >
                      {loading ? 'Publishing ...' : 'Publish now'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleShowPublishAndSendDialog}
                      size="lg"
                      color="orange"
                      disabled={loading}
                    >
                      Publish and send
                    </Button>
                  )}
                </Flex>
              </Flex>
            </Flex>
          </Container>
        </StyledDialogContent>
      </Dialog>
      <PublishAndSendDialog
        open={showPublishAndSendDialog}
        loading={loading}
        onClose={handleCancelPublishAndSendDialog}
        onConfirm={handleConfirmPublishAndSendDialog}
      />
    </>
  );
};
