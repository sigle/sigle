import { Box, Button, Flex, Typography } from '../../../ui';

export const SenderEmail = () => {
  return (
    <Box css={{ backgroundColor: '$gray2', br: '$4', padding: '$5', mt: '$5' }}>
      <Typography css={{ fontWeight: 600 }} size="h4">
        Add sender address
      </Typography>
      <Typography size="subheading" css={{ color: '$gray9', mt: '$2' }}>
        To be able to send emails, you must add/choose a sender email on your
        Mailjet account and sync below.
      </Typography>
      <Flex css={{ mt: '$5' }} gap="5">
        <Button>Sync</Button>
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
  );
};
