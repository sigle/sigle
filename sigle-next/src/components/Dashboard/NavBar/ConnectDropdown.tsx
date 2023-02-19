import { useModal } from 'connectkit';
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
import { useDashboardStore } from '../store';
import { StyledDropdownMenuItemDarkMode } from './UserDropdown';

export const ConnectDropdown = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const { setOpen: setConnectKitOpen } = useModal();
  const collapsed = useDashboardStore((state) => state.collapsed);
  const toggleCollapse = useDashboardStore((state) => state.toggleCollapse);

  const toggleTheme = () => {
    resolvedTheme === 'dark' ? setTheme('light') : setTheme('dark');
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
          onClick={() => setConnectKitOpen(true)}
        >
          Connect wallet
        </Button>
      ) : (
        <IconButton
          color="indigo"
          size="lg"
          onClick={() => setConnectKitOpen(true)}
        >
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
          <StyledDropdownMenuItemDarkMode
            // Prevent the dropdown from closing when clicking on the dark mode switch
            onSelect={(e) => e.preventDefault()}
            onClick={toggleTheme}
          >
            Dark mode
            <Switch checked={resolvedTheme === 'dark'} />
          </StyledDropdownMenuItemDarkMode>
          <StyledDropdownMenuItemDarkMode
            // Prevent the dropdown from closing when clicking on the dark mode switch
            onSelect={(e) => e.preventDefault()}
            onClick={() => toggleCollapse(!collapsed)}
          >
            Menu collapsed
            <Switch checked={collapsed} />
          </StyledDropdownMenuItemDarkMode>
        </DropdownMenuContent>
      </DropdownMenu>
    </Flex>
  );
};
