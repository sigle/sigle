import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from '@sigle/ui';

export const SettingsMenu = () => {
  const router = useRouter();

  return (
    <div className="flex gap-2">
      <Link href="/settings">
        <Button
          size="sm"
          variant="ghost"
          css={
            router.pathname === '/settings'
              ? {
                  color: '$gray10',
                  backgroundColor: '$gray4',
                }
              : {}
          }
        >
          General
        </Button>
      </Link>
      <Link href="/settings/plans">
        <Button
          size="sm"
          variant="ghost"
          css={
            router.pathname === '/settings/plans'
              ? {
                  color: '$gray10',
                  backgroundColor: '$gray4',
                }
              : {}
          }
        >
          Plans
        </Button>
      </Link>
      <Link href="/settings/import">
        <Button
          size="sm"
          variant="ghost"
          css={
            router.pathname === '/settings/import'
              ? {
                  color: '$gray10',
                  backgroundColor: '$gray4',
                }
              : {}
          }
        >
          Import
        </Button>
      </Link>
    </div>
  );
};
