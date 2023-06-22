import { CheckCircledIcon, ReloadIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { ApiError } from '../../../external/api';
import {
  useGetUserNewsletter,
  useSyncSenderNewsletter,
} from '../../../hooks/newsletters';
import { Box, Button, Flex, Typography } from '../../../ui';

export const SenderEmail = () => {
  const [successSenderEmail, setSuccessSenderEmail] = useState(false);
  const { data: userNewsletter, refetch: refetchUserNewsletter } =
    useGetUserNewsletter();
  const { mutate: syncNewsletter, isLoading: isLoadingSyncNewsletter } =
    useSyncSenderNewsletter({
      onSuccess: async () => {
        await refetchUserNewsletter();
        setSuccessSenderEmail(true);
      },
      onError: (error: Error | ApiError) => {
        let errorMessage = error.message;
        if (error instanceof ApiError && error.body.message) {
          errorMessage = error.body.message;
        }
        toast.error(errorMessage);
      },
    });

  return (
    <>
      <Box
        css={{
          backgroundColor: '$gray2',
          border: '1px solid $gray7',
          br: '$4',
          padding: '$5',
          mt: '$5',
        }}
      >
        <Typography css={{ fontWeight: 600 }} size="h4">
          Add sender address
        </Typography>
        {(!userNewsletter || !userNewsletter.senderEmail) && (
          <Typography size="subheading" css={{ color: '$gray9', mt: '$2' }}>
            To be able to send emails, you must add/choose a sender email on
            your Mailjet account and sync below.
          </Typography>
        )}
        {userNewsletter?.senderEmail && (
          <Typography size="subheading" css={{ color: '$gray9', mt: '$2' }}>
            Your newsletter will be sent from{' '}
            <Typography size="subheading" as="span" css={{ color: '$gray10' }}>
              {userNewsletter.senderEmail}
            </Typography>
            <Box
              as="span"
              css={{ color: '$green11', display: 'inline-block', ml: '$2' }}
            >
              <CheckCircledIcon />
            </Box>
          </Typography>
        )}
        <Flex css={{ mt: '$5' }} gap="5">
          <Button
            css={{ gap: '$2' }}
            onClick={() => syncNewsletter()}
            disabled={isLoadingSyncNewsletter}
          >
            <span>Sync</span> <ReloadIcon />
          </Button>
          <Button
            color="orange"
            variant="ghost"
            as="a"
            href="https://app.mailjet.com/account/sender"
            target="_blank"
            rel="noreferrer"
          >
            Add sender address
          </Button>
        </Flex>
      </Box>

      {successSenderEmail && (
        <Box
          css={{
            backgroundColor: '$green2',
            border: '1px solid $green6',
            br: '$4',
            padding: '$5',
            mt: '$5',
          }}
        >
          <Typography size="subheading" css={{ color: '$green11' }}>
            Your account is setup, you can now send newsletters!
          </Typography>
        </Box>
      )}
    </>
  );
};
