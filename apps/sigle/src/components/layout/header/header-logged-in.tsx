import { Button } from '@radix-ui/themes';
import Link from 'next/link';
import { HeaderUserDropdown } from './header-user-dropdown';

export const HeaderLoggedIn = () => {
  return (
    <>
      <Button size="2" variant="ghost" color="gray" highContrast asChild>
        <Link href="/feed">Feed</Link>
      </Button>
      <Button size="2" variant="ghost" color="gray" highContrast asChild>
        <Link href="/explore">Explore</Link>
      </Button>
      <HeaderUserDropdown />
    </>
  );
};
