import { useState } from 'react';
import { toast } from 'react-toastify';
import { Box, Button, Flex, Typography } from '../../../ui';
import { styled } from '../../../stitches.config';
import {
  useNewslettersControllerGetSenders,
  useNewslettersControllerUpdateSender,
} from '@/__generated__/sigle-api/sigleApiComponents';

const Select = styled('select', {
  minWidth: 300,
  WebkitTapHighlightColor: 'rgba(0,0,0,0)',
  backgroundColor: '$gray3',
  boxShadow: '0 0 0 1px $colors$gray7',
  ml: '1px',
  mr: '1px',
  br: '$3',
  px: '$2',
  py: '$1',
  fontSize: '$1',
  color: '$gray11',
});

export const SenderEmail = () => {
  const [newSenderId, setNewSenderId] = useState<number | null>(null);
  const [successSenderEmail, setSuccessSenderEmail] = useState(false);
  const {
    data: sendersNewsletter,
    isLoading: isLoadingSendersNewsletter,
    refetch: refetchSendersNewsletter,
  } = useNewslettersControllerGetSenders({});
  const { mutate: syncNewsletter, isLoading: isLoadingSyncNewsletter } =
    useNewslettersControllerUpdateSender({
      onSuccess: async () => {
        await refetchSendersNewsletter();
        setSuccessSenderEmail(true);
      },
      onError: (error) => {
        toast.error(error?.message);
      },
    });

  const isSenderSelected = sendersNewsletter?.some(
    (sender) => sender.isSelected,
  );

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
          Sender address
        </Typography>
        {!isLoadingSendersNewsletter && !isSenderSelected && (
          <Typography size="subheading" css={{ color: '$gray9', mt: '$2' }}>
            To be able to send emails, you must add/choose a sender email from
            your Mailjet account.
          </Typography>
        )}
        {!isLoadingSendersNewsletter && (
          <Select
            css={{ mt: '$2' }}
            value={
              newSenderId ??
              sendersNewsletter?.find((list) => list.isSelected)?.id ??
              'default'
            }
            onChange={(e) => setNewSenderId(Number(e.target.value))}
          >
            <option disabled value="default">
              -- select a sender address --
            </option>
            {sendersNewsletter?.map((list) => (
              <option key={list.id} value={list.id}>
                {list.email} {list.isSelected ? ' (selected)' : ''}
              </option>
            ))}
          </Select>
        )}
        <Flex css={{ mt: '$5' }} gap="5">
          <Button
            css={{ gap: '$2' }}
            onClick={() =>
              syncNewsletter({
                body: {
                  senderId: newSenderId || 0,
                },
              })
            }
            disabled={isLoadingSyncNewsletter}
          >
            Submit
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
