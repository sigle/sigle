import { ArrowLeftIcon, CheckCircledIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useGetUserSubscription } from '../../hooks/subscriptions';
import { styled } from '../../stitches.config';
import { Story } from '../../types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Flex,
  FormTextarea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Typography,
} from '../../ui';
import { VisuallyHidden } from '../../ui/VisuallyHidden';
import { useFeatureFlags } from '../../utils/featureFlags';
import { PublishAndSendDialog } from './PublishAndSendDialog';
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
    px: 220,
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
  const { isExperimentalNewsletterEnabled } = useFeatureFlags();
  const [newsletterActive, setNewsletterActive] = useState(
    isExperimentalNewsletterEnabled
  );
  const [testMailSent, setTestMailSent] = useState(false);
  const [showPublishAndSendDialog, setShowPublishAndSendDialog] =
    useState(false);
  const [tabValue, setTabValue] = useState<'publish only' | 'publish and send'>(
    newsletterActive && userSubscription ? 'publish and send' : 'publish only'
  );

  const experimentalNewsletterKey = 'sigle-experimental-newsletter';

  // to be replaced with data from the server
  const newsletterActivated = newsletterActive && userSubscription;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    setTestMailSent(true);
  };

  const handleShowPublishAndSendDialog = () =>
    setShowPublishAndSendDialog(true);

  const handleCancelPublishAndSendDialog = () =>
    setShowPublishAndSendDialog(false);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <StyledDialogContent closeButton={false}>
        <VisuallyHidden>
          <DialogTitle>Preview and publish your story</DialogTitle>
        </VisuallyHidden>
        <Button onClick={onClose} variant="ghost" css={{ gap: '$2' }} size="sm">
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
            maxWidth: 700,

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
                  flexDirection: newsletterActivated ? 'row-reverse' : 'row',
                }}
              >
                <StyledTrigger value="publish only">Publish only</StyledTrigger>
                <StyledTrigger
                  disabled={!newsletterActive || !userSubscription}
                  value="publish and send"
                  css={{
                    textDecoration: userSubscription ? 'none' : 'line-through',
                  }}
                >
                  Publish and send
                </StyledTrigger>
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
                <Typography size="subheading">
                  To start sending your first emails, you must{' '}
                  {!userSubscription &&
                    `upgrade your plan
                  and`}{' '}
                  activate the newsletter feature.
                </Typography>
                {userSubscription ? (
                  <>
                    {!newsletterActive && (
                      <Button
                        onClick={() => {
                          setNewsletterActive(true);
                          setTabValue('publish and send');
                          localStorage.setItem(
                            experimentalNewsletterKey,
                            'true'
                          );
                        }}
                        css={{ alignSelf: 'start' }}
                        variant="subtle"
                      >
                        Activate newsletter feature
                      </Button>
                    )}
                  </>
                ) : (
                  <Link href="/settings/plans" passHref>
                    <Button
                      as="a"
                      css={{ alignSelf: 'start' }}
                      variant="subtle"
                    >
                      Upgrade to the Creator+ plan
                    </Button>
                  </Link>
                )}
              </TabsContent>

              <TabsContent value="publish and send">
                <Accordion collapsible type="single">
                  <AccordionItem value="item1">
                    <AccordionTrigger>Send a test email</AccordionTrigger>
                    <AccordionContent
                      css={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '$3',
                      }}
                    >
                      {testMailSent ? (
                        <Typography
                          size="subheading"
                          css={{
                            mt: '$2',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '$2',
                            justifyContent: 'center',
                          }}
                        >
                          <span>
                            <CheckCircledIcon />
                          </span>
                          Test emails sent!
                        </Typography>
                      ) : (
                        <>
                          <Box
                            css={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '$3',
                            }}
                            onSubmit={handleSubmit}
                            as="form"
                          >
                            <FormTextarea
                              css={{
                                minHeight: 78,
                                m: 1,
                              }}
                              placeholder="Send up to 5 emails separated by commas"
                            />
                            <Button type="submit">Send test mail</Button>
                          </Box>
                        </>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
              {newsletterActivated ? (
                <Button
                  onClick={handleShowPublishAndSendDialog}
                  size="lg"
                  color="orange"
                  disabled={loading}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  size="lg"
                  color="orange"
                  disabled={loading}
                  onClick={onConfirm}
                >
                  {loading ? 'Publishing ...' : 'Publish now'}
                </Button>
              )}
            </Flex>
          </Flex>
        </Flex>
      </StyledDialogContent>

      <PublishAndSendDialog
        open={showPublishAndSendDialog}
        onClose={handleCancelPublishAndSendDialog}
        onConfirm={onConfirm}
      />
    </Dialog>
  );
};
