import { useGetContactsListsNewsletter } from '../../../hooks/newsletters';
import { Box, Button, Flex, Typography } from '../../../ui';

export const MailjetList = () => {
  const { data: contactsLists } = useGetContactsListsNewsletter();

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
      <select value={contactsLists?.find((list) => list.isSelected)?.id}>
        {contactsLists?.map((list) => (
          <option key={list.id} value={list.id}>
            {list.name} - {list.subscriberCount} subscribers
            {list.isDeleted ? ' (deleted)' : ''}
            {list.isSelected ? ' (selected)' : ''}
          </option>
        ))}
      </select>
      <Flex css={{ mt: '$5' }}>
        <Button
        // onClick={() => syncNewsletter()}
        // disabled={isLoadingSyncNewsletter}
        >
          <span>Submit</span>
        </Button>
      </Flex>
    </Box>
  );
};
