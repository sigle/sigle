import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { Button, IconButton } from '@radix-ui/themes';
import { useState } from 'react';
import Link from 'next/link';
import { MobileDrawer } from '../mobile-drawer';

export const HeaderMobile = () => {
  const [showMobileHeaderDialog, setShowMobileHeaderDialog] = useState(false);

  return (
    <>
      <Button color="gray" highContrast asChild>
        <Link href="/stories/new">Write</Link>
      </Button>
      <IconButton
        size="3"
        variant="ghost"
        color="gray"
        onClick={() => setShowMobileHeaderDialog(true)}
      >
        <HamburgerMenuIcon />
      </IconButton>

      <MobileDrawer
        open={showMobileHeaderDialog}
        onOpenChange={(open) => setShowMobileHeaderDialog(open)}
      />
    </>
  );
};
