import { ArrowLeftIcon, CheckCircledIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Dialog, Tabs } from '@radix-ui/themes';
import {
  useUserControllerGetUserMe,
  useSubscriptionControllerGetUserMe,
  useStoriesControllerGet,
} from '@/__generated__/sigle-api';
import { cn } from '@/lib/cn';
import { styled } from '../../stitches.config';
import { Story } from '../../types';
import { Box, Button, Container, Flex, Typography } from '../../ui';
import { VisuallyHidden } from '../../ui/VisuallyHidden';
import { PublishAndSendDialog } from './PublishAndSendDialog';
import { SendTestEmail } from './PublishDialog/SendTestEmail';
import { TwitterCardPreview } from './TwitterCardPreview';

const StyledDialogContent = styled(Dialog.Content, {
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
      <Dialog.Root open={open} onOpenChange={onClose}>
        <StyledDialogContent size="3">
          <Container>
            <VisuallyHidden>
              <Dialog.Title>Preview and publish your story</Dialog.Title>
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
                <Tabs.Root
                  value={tabValue}
                  onValueChange={(value) => setTabValue(value as any)}
                >
                  <Tabs.List
                    className={cn('self-start mb-4', {
                      'flex-row': !isNewsletterActive,
                      'flex-row-reverse': isNewsletterActive,
                    })}
                  >
                    <Tabs.Trigger value="publish only">
                      Publish only
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      disabled={isStoryAlreadySent || !hasActiveSubscription}
                      value="publish and send"
                    >
                      Publish and send
                    </Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content
                    className="flex flex-col gap-5"
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
                  </Tabs.Content>

                  <Tabs.Content
                    className="flex flex-col gap-5"
                    value="publish and send"
                  >
                    {!isStoryAlreadySent &&
                      hasActiveSubscription &&
                      isNewsletterActive && <SendTestEmail story={story} />}
                  </Tabs.Content>
                </Tabs.Root>
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
      </Dialog.Root>

      <PublishAndSendDialog
        open={showPublishAndSendDialog}
        loading={loading}
        onClose={handleCancelPublishAndSendDialog}
        onConfirm={handleConfirmPublishAndSendDialog}
      />
    </>
  );
};
