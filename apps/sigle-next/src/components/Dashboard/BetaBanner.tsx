import { Box, Typography } from '@sigle/ui';

export const BetaBanner = () => {
  return (
    <Box
      css={{
        borderBottom: '1px solid $gray6',
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: '$4',
      }}
    >
      <Typography size="xs" color="orange">
        You are currently on an alpha version of Sigle v2.0 (testnet). All your
        data and articles <strong>will be deleted</strong> for the mainnet
        launch.
      </Typography>
    </Box>
  );
};
