import { useTheme } from 'next-themes';
import Link from 'next/link';
import { TbChevronDown } from 'react-icons/tb';
import { useDisconnect } from 'wagmi';
import { graphql, useFragment } from 'react-relay';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Typography,
  DropdownMenuSeparator,
  Switch,
  Flex,
} from '@sigle/ui';
import { styled } from '@sigle/stitches.config';
import { addressAvatar } from '@/utils';
import { createNewEnvironment, useRelayStore } from '@/lib/relay';
import { shortenAddress } from '@/utils/shortenAddress';
import { composeClient } from '@/lib/composeDB';
import { useDashboardStore } from '../store';
import { UserDropdown_viewer$key } from '@/__generated__/relay/UserDropdown_viewer.graphql';
import { getAddressFromDid } from '@/utils/getAddressFromDid';

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

export const DropdownMenuItemWithSwitch = styled(DropdownMenuItem, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '$2',
});

export const NavBarUserDropdown = (props: {
  user: UserDropdown_viewer$key;
}) => {
  const { resolvedTheme, setTheme } = useTheme();
  const collapsed = useDashboardStore((state) => state.collapsed);
  const toggleCollapse = useDashboardStore((state) => state.toggleCollapse);
  const setEnvironment = useRelayStore((store) => store.setEnvironment);
  const { disconnect } = useDisconnect();

  const user = useFragment(
    graphql`
      fragment UserDropdown_viewer on CeramicAccount {
        id
        profile {
          id
          displayName
        }
      }
    `,
    props.user
  );

  const toggleTheme = () => {
    resolvedTheme === 'dark' ? setTheme('light') : setTheme('dark');
  };

  const handleLogout = () => {
    // TODO clean ceramic did-session local storage
    composeClient.setDID(null as any);
    // Disconnect from wallet
    disconnect();
    // Reset the relay environment to rerun all the queries as unauthenticated
    setEnvironment(createNewEnvironment());
  };

  const address = getAddressFromDid(user.id);

  return (
    <Flex>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {!collapsed ? (
            <UserMenu>
              <LeftContainer>
                <ImageAvatarContainer>
                  <img src={addressAvatar(address, 36)} alt="user avatar" />
                </ImageAvatarContainer>
                <div>
                  <Typography size="xs" lineClamp={1}>
                    {user.profile?.displayName || shortenAddress(address)}
                  </Typography>
                  <Typography css={{ color: '$gray9' }} size="xs" lineClamp={1}>
                    {shortenAddress(address)}
                  </Typography>
                </div>
              </LeftContainer>
              <StyledTbChevronDown />
            </UserMenu>
          ) : collapsed ? (
            <ImageAvatarContainer>
              <img src={addressAvatar(address, 36)} alt="user avatar" />
            </ImageAvatarContainer>
          ) : null}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={collapsed ? 'right' : 'top'}
          align={collapsed ? 'end' : 'center'}
          sideOffset={12}
        >
          <Link href="/settings">
            <DropdownMenuItem>Settings</DropdownMenuItem>
          </Link>
          <Link href="/settings">
            <DropdownMenuItem>Upgrade</DropdownMenuItem>
          </Link>
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
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Flex>
  );
};
