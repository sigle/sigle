import { styled } from '@sigle/stitches.config';
import { Badge, Button, Flex, IconButton, Typography } from '@sigle/ui';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  TbBook,
  TbBookmarks,
  TbChartPie,
  TbHome,
  TbMail,
  TbPlus,
  TbUserCircle,
  TbUsers,
} from 'react-icons/tb';
import { LogoImage } from '../../images/logo';
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

const NavBarLinkButton = styled(Button, {
  width: '100%',
  justifyContent: 'start',
  fontWeight: 400,
  px: '$3',
  fontSize: '$md',
  lineHeight: '$md',
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

const navbarIconSize = 20;

const Menu = styled('div', {
  mt: 44,
});

const NavBarLinkContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$1',
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
      <NavBarLinkButton variant="ghost" leftIcon={icon} active={active}>
        {label}
      </NavBarLinkButton>
    </Link>
  );
};

const NavBarStoriesContainer = styled('div', {
  py: '$5',
  display: 'flex',
  flexDirection: 'column',
  gap: '$1',
});

const NavBarLinkStoriesButton = styled(Button, {
  width: '100%',
  justifyContent: 'flex-start',
  fontWeight: 400,
  gap: '$2',
  px: '$3',
  fontSize: '$md',
  lineHeight: '$md',

  variants: {
    size: {
      md: {
        pl: '38px',
        pr: '0px',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

interface NavBarProps {}

export const NavBar = ({}: NavBarProps) => {
  const router = useRouter();

  const menu = [
    {
      href: '/',
      icon: <TbHome size={navbarIconSize} />,
      label: 'Home',
    },
    {
      href: '/feed',
      icon: <TbMail size={navbarIconSize} />,
      label: 'Inbox',
    },
    {
      href: '/saved',
      icon: <TbBookmarks size={navbarIconSize} />,
      label: 'Saved',
    },
    {
      href: '/profile',
      icon: <TbUserCircle size={navbarIconSize} />,
      label: 'Profile',
    },
  ];

  const menu2 = [
    {
      href: '/analytics',
      icon: <TbChartPie size={navbarIconSize} />,
      label: 'Analytics',
    },
    {
      href: '/feed',
      icon: <TbUsers size={navbarIconSize} />,
      label: 'Subscribers',
    },
  ];

  return (
    <StyledNavBar>
      <div>
        <LogoImage />
        <Menu>
          <NavBarLinkContainer>
            {menu.map((item, index) => (
              <NavBarLink
                key={index}
                {...item}
                active={router.pathname === item.href}
              />
            ))}
          </NavBarLinkContainer>

          <NavBarStoriesContainer>
            <Flex justify="between" align="center" css={{ pl: '10px' }}>
              <Flex align="center" gap="2">
                <TbBook size={navbarIconSize} />
                <Typography>Stories</Typography>
              </Flex>
              <IconButton variant="light">
                <TbPlus />
              </IconButton>
            </Flex>
            <NavBarLinkStoriesButton variant="ghost">
              Drafts <Badge>9</Badge>
            </NavBarLinkStoriesButton>
            <NavBarLinkStoriesButton variant="ghost">
              Published <Badge>10</Badge>
            </NavBarLinkStoriesButton>
          </NavBarStoriesContainer>

          <NavBarLinkContainer>
            {menu2.map((item, index) => (
              <NavBarLink
                key={index}
                {...item}
                active={router.pathname === item.href}
              />
            ))}
          </NavBarLinkContainer>
        </Menu>
      </div>
      <NavBarUserDropdown />
    </StyledNavBar>
  );
};
