import { useTheme } from 'next-themes';
import { TbSettings, TbWallet } from 'react-icons/tb';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Flex,
  IconButton,
  Switch,
} from '@sigle/ui';
import { useAuthModal } from '@/components/AuthModal/AuthModal';
import { useDashboardStore } from '../store';
import { DropdownMenuItemWithSwitch } from './UserDropdown';

export const ConnectDropdown = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const { setOpen } = useAuthModal();
  const collapsed = useDashboardStore((state) => state.collapsed);
  const toggleCollapse = useDashboardStore((state) => state.toggleCollapse);

  const toggleTheme = () => {
    resolvedTheme === 'dark' ? setTheme('light') : setTheme('dark');
  };

  const openStacksConnect = () => {
    setOpen(true);
  };

  return (
    <Flex
      gap="3"
      justify="between"
      direction={collapsed ? 'columnReverse' : 'row'}
    >
      {!collapsed ? (
        <Button
          color="indigo"
          size="lg"
          rightIcon={<TbWallet />}
          css={{ flex: 1 }}
          onClick={openStacksConnect}
        >
          Connect wallet
        </Button>
      ) : (
        <IconButton color="indigo" size="lg" onClick={openStacksConnect}>
          <TbWallet />
        </IconButton>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {!collapsed ? (
            <IconButton variant="light" size="lg">
              <TbSettings />
            </IconButton>
          ) : collapsed ? (
            <IconButton variant="light" size="lg">
              <TbSettings />
            </IconButton>
          ) : null}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={collapsed ? 'right' : 'top'}
          align={collapsed ? 'start' : 'center'}
          sideOffset={12}
        >
          <DropdownMenuItemWithSwitch
            // Prevent the dropdown from closing when clicking on the dark mode switch
            onSelect={(e) => e.preventDefault()}
            onClick={toggleTheme}
          >
            Dark mode
            <Switch checked={resolvedTheme === 'dark'} />
          </DropdownMenuItemWithSwitch>
          <DropdownMenuItemWithSwitch
            // Prevent the dropdown from closing when clicking on the dark mode switch
            onSelect={(e) => e.preventDefault()}
            onClick={() => toggleCollapse(!collapsed)}
          >
            Menu collapsed
            <Switch checked={collapsed} />
          </DropdownMenuItemWithSwitch>
        </DropdownMenuContent>
      </DropdownMenu>
    </Flex>
  );
};
