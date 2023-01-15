import { styled } from '@sigle/stitches.config';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Typography,
  DropdownMenuSeparator,
  Switch,
} from '@sigle/ui';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { TbChevronDown } from 'react-icons/tb';

const UserMenu = styled('div', {
  backgroundColor: '$gray3',
  br: '$sm',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '$2',
  p: '$3',
  cursor: 'pointer',
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
  overflow: 'hidden',
  width: 36,
  height: 36,
  br: '$sm',
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

interface NavBarUserDropdownProps {
  isCollapsed: boolean;
}

export const NavBarUserDropdown = ({}: NavBarUserDropdownProps) => {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    resolvedTheme === 'dark' ? setTheme('light') : setTheme('dark');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserMenu>
          <LeftContainer>
            <ImageAvatarContainer>
              <img
                src="https://gaia.blockstack.org/hub/1Mqh6Lqyqdjcu8PHczewej4DZmMjFp1ZEt/photos/settings/1664899611226-mAorjrYd_400x400.jpg"
                alt="user avatar"
              />
            </ImageAvatarContainer>
            <div>
              <Typography size="xs" lineClamp={1}>
                Marly McKendry
              </Typography>
              <Typography css={{ color: '$gray9' }} size="xs" lineClamp={1}>
                markendry.btc
              </Typography>
            </div>
          </LeftContainer>
          <StyledTbChevronDown />
        </UserMenu>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="center" sideOffset={12}>
        <Link href="/settings">
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem>Upgrade</DropdownMenuItem>
        </Link>
        <StyledDropdownMenuItemDarkMode
          // Prevent the dropdown from closing when clicking on the dark mode switch
          onSelect={(e) => e.preventDefault()}
          onClick={toggleTheme}
        >
          Dark mode
          <Switch checked={resolvedTheme === 'dark'} />
        </StyledDropdownMenuItemDarkMode>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
