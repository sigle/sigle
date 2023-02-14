import Link from 'next/link';
import { Button, Flex, Typography } from '@sigle/ui';

export const UserProfilePageHeader = () => {
  return (
    <Flex justify="between" css={{ flex: 1 }}>
      <Typography size="xl" fontWeight="bold">
        Profile
      </Typography>
      <Link href="/editor/new">
        <Button>Write story</Button>
      </Link>
    </Flex>
  );
};
