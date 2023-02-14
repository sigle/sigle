import { Button, Flex, Typography } from '@sigle/ui';
import Link from 'next/link';

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
