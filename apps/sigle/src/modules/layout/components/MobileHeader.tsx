import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Separator, Switch } from '@radix-ui/themes';
import {
  ArchiveIcon,
  CrumpledPaperIcon,
  EyeOpenIcon,
  HomeIcon,
  LightningBoltIcon,
  MixIcon,
} from '@radix-ui/react-icons';
import { Drawer } from 'vaul';
import { userSession } from '../../../utils/stacks';
import { useAuth } from '../../auth/AuthContext';

interface MobileHeaderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileHeader = ({ open, onOpenChange }: MobileHeaderProps) => {
  const { resolvedTheme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleThemeToggle = () => {
    resolvedTheme === 'dark' ? setTheme('light') : setTheme('dark');
  };

  const handleLogout = () => {
    queryClient.removeQueries();
    userSession.signUserOut();
    signOut();
  };

  const upperNavItems = [
    {
      name: 'Drafts',
      path: '/',
      icon: CrumpledPaperIcon,
    },
    {
      name: 'Published',
      path: '/published',
      icon: ArchiveIcon,
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: MixIcon,
    },
    {
      name: 'Feed',
      path: '/feed',
      icon: LightningBoltIcon,
    },
    {
      name: 'Explore',
      path: '/explore',
      icon: EyeOpenIcon,
    },
    {
      name: 'Profile',
      path: '/[username]',
      icon: HomeIcon,
    },
  ];

  const lowerNavItems = [
    {
      name: 'Settings',
      path: '/settings',
    },
  ];

  return (
    <Drawer.Root shouldScaleBackground open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal
        // Should be rendered in the radix container to have access to the theme variables
        container={
          typeof window !== 'undefined'
            ? (window.document.querySelectorAll(
                '[data-is-root-theme="true"]',
              )[0] as HTMLElement)
            : undefined
        }
      >
        <Drawer.Overlay
          className="fixed inset-0 bg-[rgba(0,0,0,0.4)]"
          onClick={() => onOpenChange(false)}
        />
        <Drawer.Content className="fixed inset-x-0 bottom-0 mt-24 flex h-full max-h-[96%] flex-col rounded-t-[10px]">
          <div className="flex flex-1 flex-col gap-5 overflow-auto rounded-t-[10px] bg-gray-1 p-4">
            <div className="mx-auto mb-4 h-1.5 w-12 shrink-0 rounded-2 bg-gray-6" />

            {upperNavItems.map(({ name, path, icon: Icon }) => (
              <Button
                key={name}
                variant="ghost"
                color="gray"
                size="3"
                radius="none"
                asChild
              >
                <Link
                  href={path}
                  as={path === '/[username]' ? `/${user?.username}` : undefined}
                  className="flex w-full items-center justify-start gap-3"
                >
                  <Icon />
                  {name}
                </Link>
              </Button>
            ))}
            <Separator orientation="horizontal" className="w-full" />
            {lowerNavItems.map((item) => (
              <Button
                key={item.name}
                className="w-full justify-between"
                variant="ghost"
                color="gray"
                size="3"
                radius="none"
                asChild
              >
                <Link href={item.path}>{item.name}</Link>
              </Button>
            ))}
            <Button
              className="w-full justify-between"
              variant="ghost"
              color="gray"
              size="3"
              radius="none"
              onClick={handleThemeToggle}
              asChild
            >
              <div>
                Dark mode
                <Switch
                  color="orange"
                  checked={resolvedTheme === 'dark'}
                  radius="medium"
                />
              </div>
            </Button>
            <Separator orientation="horizontal" className="w-full" />
            <Button
              className="w-full justify-start"
              variant="ghost"
              color="gray"
              size="3"
              radius="none"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
