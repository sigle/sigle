import { styled } from '@sigle/stitches.config';
import { Button } from '@sigle/ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  TbBookmarks,
  TbChartPie,
  TbHome,
  TbMail,
  TbUserCircle,
  TbUsers,
} from 'react-icons/tb';
import { LogoImage } from 'src/images/logo';
import { NavBarUserDropdown } from './NavBarUserDropdown';

const StyledNavBar = styled('nav', {
  px: '$5',
  py: '$5',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '$gray1',
  justifyContent: 'space-between',
  borderStyle: 'solid',
  borderRightWidth: '1px',
  borderColor: '$gray6',
});

const StyledButton = styled(Button, {
  width: '100%',
  justifyContent: 'start',
  fontWeight: 400,
  px: '$3',
  variants: {
    active: {
      true: {
        boxShadow: '0 0 0 1px $colors$gray6',
        backgroundColor: '$gray3',
        fontWeight: 600,
      },
    },
  },
});

const Menu = styled('div', {
  mt: 44,
});

interface NavBarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

const NavBarLink = ({ href, icon, label, active }: NavBarLinkProps) => {
  return (
    <Link href={href}>
      <StyledButton variant="ghost" leftIcon={icon} active={active}>
        {label}
      </StyledButton>
    </Link>
  );
};

interface NavBarProps {}

export const NavBar = ({}: NavBarProps) => {
  const router = useRouter();

  const menu = [
    {
      href: '/',
      icon: <TbHome />,
      label: 'Home',
    },
    {
      href: '/feed',
      icon: <TbMail />,
      label: 'Inbox',
    },
    {
      href: '/saved',
      icon: <TbBookmarks />,
      label: 'Saved',
    },
    {
      href: '/profile',
      icon: <TbUserCircle />,
      label: 'Profile',
    },
  ];

  const menu2 = [
    {
      href: '/analytics',
      icon: <TbChartPie />,
      label: 'Analytics',
    },
    {
      href: '/feed',
      icon: <TbUsers />,
      label: 'Subscribers',
    },
  ];

  return (
    <StyledNavBar>
      <div>
        <LogoImage />
        <Menu>
          {menu.map((item, index) => (
            <NavBarLink
              key={index}
              {...item}
              active={router.pathname === item.href}
            />
          ))}
          {menu2.map((item, index) => (
            <NavBarLink
              key={index}
              {...item}
              active={router.pathname === item.href}
            />
          ))}
        </Menu>
      </div>
      <NavBarUserDropdown />
    </StyledNavBar>
  );
};
