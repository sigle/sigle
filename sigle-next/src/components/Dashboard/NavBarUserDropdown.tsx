import { useTheme } from 'next-themes';
import Link from 'next/link';
import { TbChevronDown, TbSettings } from 'react-icons/tb';
import { useAccount, useDisconnect } from 'wagmi';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Typography,
  DropdownMenuSeparator,
  Switch,
  IconButton,
} from '@sigle/ui';
import { styled } from '@sigle/stitches.config';
import { useIsMounted } from '@sigle/hooks';
import { addressAvatar } from '@/utils';
import { useDashboardStore } from './store';

const UserMenu = styled('div', {
  backgroundColor: '$gray3',
  br: '$sm',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '$2',
  p: '$3',
  cursor: 'pointer',
  flex: 1,
  '&:hover': {
    backgroundColor: '$gray5',
  },
  '&:active': {
    backgroundColor: '$gray4',
  },
});

const LeftContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$2',
});

const ImageAvatarContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'center',
  overflow: 'hidden',
  width: 36,
  height: 36,
  br: '$sm',
  cursor: 'pointer',
});

const StyledTbChevronDown = styled(TbChevronDown, {
  color: '$gray11',
  transition: 'transform 300ms cubic-bezier(0.87, 0, 0.13, 1)',
  '[data-state=open] &': { transform: 'rotate(180deg)' },
});

const StyledDropdownMenuItemDarkMode = styled(DropdownMenuItem, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '$2',
});

export const NavBarUserDropdown = () => {
  const { resolvedTheme, setTheme } = useTheme();
  const collapsed = useDashboardStore((state) => state.collapsed);
  const toggleCollapse = useDashboardStore((state) => state.toggleCollapse);
  const isMounted = useIsMounted();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  const toggleTheme = () => {
    resolvedTheme === 'dark' ? setTheme('light') : setTheme('dark');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {!isMounted() ? null : !collapsed && !isConnected ? ( // TODO when component is not mounter, add a skeleton
          <IconButton variant="light" size="lg">
            <TbSettings />
          </IconButton>
        ) : collapsed && !isConnected ? (
          <IconButton variant="light" size="lg">
            <TbSettings />
          </IconButton>
        ) : !collapsed && isConnected && address ? (
          <UserMenu>
            <LeftContainer>
              <ImageAvatarContainer>
                <img src={addressAvatar(address, 36)} alt="user avatar" />
              </ImageAvatarContainer>
              <div>
                <Typography size="xs" lineClamp={1}>
                  {`${address.split('').slice(0, 5).join('')}…${address
                    .split('')
                    .slice(-5)
                    .join('')}`}
                </Typography>
                <Typography css={{ color: '$gray9' }} size="xs" lineClamp={1}>
                  {`${address.split('').slice(0, 5).join('')}…${address
                    .split('')
                    .slice(-5)
                    .join('')}`}
                </Typography>
              </div>
            </LeftContainer>
            <StyledTbChevronDown />
          </UserMenu>
        ) : collapsed && isConnected && address ? (
          <ImageAvatarContainer>
            <img src={addressAvatar(address, 36)} alt="user avatar" />
          </ImageAvatarContainer>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={collapsed ? 'right' : 'top'}
        align={
          collapsed && isConnected
            ? 'end'
            : !collapsed && !isConnected
            ? 'start'
            : 'center'
        }
        sideOffset={12}
      >
        {isConnected && (
          <Link href="/settings">
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </Link>
        )}
        {isConnected && (
          <Link href="/settings">
            <DropdownMenuItem>Upgrade</DropdownMenuItem>
          </Link>
        )}
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
        {isConnected && <DropdownMenuSeparator />}
        {isConnected && (
          // TODO clean ceramic did-session local storage
          <DropdownMenuItem onClick={() => disconnect()}>
            Log out
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
