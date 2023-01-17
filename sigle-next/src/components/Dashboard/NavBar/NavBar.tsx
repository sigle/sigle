import { useIsMounted } from '@sigle/hooks';
import { styled } from '@sigle/stitches.config';
import {
  Badge,
  Button,
  Flex,
  IconButton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Typography,
} from '@sigle/ui';
import { useModal } from 'connectkit';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  TbBook,
  TbBookmarks,
  TbChartPie,
  TbHome,
  TbKey,
  TbMail,
  TbNews,
  TbNotebook,
  TbPlus,
  TbUserCircle,
  TbUsers,
} from 'react-icons/tb';
import { useAccount } from 'wagmi';
import { LogoImage } from '../../../images/Logo';
import { LogoOnlyImage } from '../../../images/LogoOnly';
import { useDashboardStore } from '../store';
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

const NavBarLinkIconButton = styled(IconButton, {
  variants: {
    active: {
      true: {
        boxShadow: '0 0 0 1px $colors$gray6',
        backgroundColor: '$gray3',
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
  isCollapsed: boolean;
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavBarLink = ({
  isCollapsed,
  href,
  icon,
  label,
  active,
}: NavBarLinkProps) => {
  if (isCollapsed) {
    return (
      <Tooltip delayDuration={600}>
        <TooltipTrigger asChild>
          <Link href={href}>
            <NavBarLinkIconButton variant="ghost" size="lg" active={active}>
              {icon}
            </NavBarLinkIconButton>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

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
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export const NavBar = () => {
  const router = useRouter();
  const collapsed = useDashboardStore((state) => state.collapsed);
  const isMounted = useIsMounted();
  const { isConnected } = useAccount();
  const { setOpen: setConnectKitOpen } = useModal();

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
        {collapsed ? (
          <Flex justify="center">
            <LogoOnlyImage />
          </Flex>
        ) : (
          <LogoImage />
        )}
        <Menu>
          <NavBarLinkContainer>
            {menu.map((item, index) => (
              <NavBarLink
                key={index}
                {...item}
                isCollapsed={collapsed}
                active={router.pathname === item.href}
              />
            ))}
          </NavBarLinkContainer>

          <NavBarStoriesContainer>
            {!collapsed && (
              <Flex justify="between" align="center" css={{ pl: '10px' }}>
                <Flex align="center" gap="2">
                  <TbBook size={navbarIconSize} />
                  <Typography>Stories</Typography>
                </Flex>
                <IconButton variant="light">
                  <TbPlus />
                </IconButton>
              </Flex>
            )}
            {collapsed ? (
              <NavBarLink
                isCollapsed={collapsed}
                icon={<TbNotebook size={navbarIconSize} />}
                label="Drafts"
                href="/"
                active={false}
              />
            ) : (
              <NavBarLinkStoriesButton variant="ghost">
                Drafts <Badge>9</Badge>
              </NavBarLinkStoriesButton>
            )}
            {collapsed ? (
              <NavBarLink
                isCollapsed={collapsed}
                icon={<TbNews size={navbarIconSize} />}
                label="Published"
                href="/"
                active={false}
              />
            ) : (
              <NavBarLinkStoriesButton variant="ghost">
                Published <Badge>10</Badge>
              </NavBarLinkStoriesButton>
            )}
          </NavBarStoriesContainer>

          <NavBarLinkContainer>
            {menu2.map((item, index) => (
              <NavBarLink
                key={index}
                {...item}
                isCollapsed={collapsed}
                active={router.pathname === item.href}
              />
            ))}
          </NavBarLinkContainer>
        </Menu>
      </div>
      <Flex
        gap="3"
        justify="between"
        direction={collapsed ? 'columnReverse' : 'row'}
      >
        {!isMounted() ? null : !collapsed && !isConnected ? (
          <Button
            color="indigo"
            size="lg"
            rightIcon={<TbKey />}
            css={{ flex: 1 }}
            onClick={() => setConnectKitOpen(true)}
          >
            Connect wallet
          </Button>
        ) : collapsed && !isConnected ? (
          <IconButton
            color="indigo"
            size="lg"
            onClick={() => setConnectKitOpen(true)}
          >
            <TbKey />
          </IconButton>
        ) : null}
        <NavBarUserDropdown />
      </Flex>
    </StyledNavBar>
  );
};
