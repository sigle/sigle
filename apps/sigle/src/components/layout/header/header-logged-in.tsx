import { Button } from '@radix-ui/themes';
import Link from 'next/link';
import { HeaderDropdown } from '@/modules/layout/components/HeaderDropdown';

export const HeaderLoggedIn = () => {
  return (
    <>
      <Button size="2" variant="ghost" color="gray" highContrast asChild>
        <Link href="/feed">Feed</Link>
      </Button>
      <Button size="2" variant="ghost" color="gray" highContrast asChild>
        <Link href="/explore">Explore</Link>
      </Button>
      <HeaderDropdown />
    </>
  );
};
