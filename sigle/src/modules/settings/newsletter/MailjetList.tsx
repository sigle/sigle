import { useState } from 'react';
import { toast } from 'react-toastify';
import { useUpdateContactsListNewsletter } from '../../../hooks/newsletters';
import { styled } from '../../../stitches.config';
import { Box, Button, Flex, Typography } from '../../../ui';
import { ApiError } from '../../../external/api';
import { useNewslettersControllerGetContactsLists } from '@/__generated__/sigle-api/sigleApiComponents';

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

export const MailjetList = () => {
  const [newListId, setNewListId] = useState<number | null>(null);
  const { data: contactsLists, refetch: refetchContactsLists } =
    useNewslettersControllerGetContactsLists({});
  const {
    mutate: updateContactsListNewsletter,
    isLoading: isLoadingUpdateContactsListNewsletter,
  } = useUpdateContactsListNewsletter({
    onSuccess: async () => {
      await refetchContactsLists();
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
        Mailjet list
      </Typography>
      <Select
        css={{ mt: '$2' }}
        value={newListId ?? contactsLists?.find((list) => list.isSelected)?.id}
        onChange={(e) => setNewListId(Number(e.target.value))}
      >
        {contactsLists?.map((list) => (
          <option key={list.id} value={list.id}>
            {list.name} - {list.subscriberCount} subscribers
            {list.isDeleted ? ' (deleted)' : ''}
            {list.isSelected ? ' (selected)' : ''}
          </option>
        ))}
      </Select>
      <Flex css={{ mt: '$5' }}>
        <Button
          onClick={() =>
            updateContactsListNewsletter({
              listId: newListId || 0,
            })
          }
          disabled={isLoadingUpdateContactsListNewsletter || !newListId}
        >
          <span>Submit</span>
        </Button>
      </Flex>
    </Box>
  );
};
