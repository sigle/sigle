import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  TbBook,
  TbChartPie,
  TbHome,
  TbMail,
  TbNews,
  TbNotebook,
  TbPlus,
  TbUserCircle,
  TbUsers,
} from 'react-icons/tb';
import { styled } from '@sigle/stitches.config';
import {
  NumberBadge,
  Button,
  Flex,
  IconButton,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  Typography,
} from '@sigle/ui';
import { trpc } from '@/utils/trpc';
import { useCeramic } from '../Ceramic/CeramicProvider';
import { useDashboardStore } from './store';
import { NavBarUserDropdown } from './NavBar/UserDropdown';
import { ConnectDropdown } from './NavBar/ConnectDropdown';

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
          <NavBarLinkIconButton
            as={Link}
            href={href}
            variant="ghost"
            size="lg"
            active={active}
          >
            {icon}
          </NavBarLinkIconButton>
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
    active: {
      true: {
        boxShadow: '0 0 0 1px $colors$gray6',
        backgroundColor: '$gray3',
        fontWeight: 600,
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
  const { session } = useCeramic();

  const did = session?.did.parent;
  const skipProfileQuery = !did;
  const profile = trpc.userProfile.useQuery(
    { did: did ?? '' },
    { enabled: !skipProfileQuery }
  );

  const postsNumbers = trpc.postsNumbers.useQuery(
    { did: did ?? '' },
    { enabled: !skipProfileQuery }
  );

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
    // {
    //   href: '/saved',
    //   icon: <TbBookmarks size={navbarIconSize} />,
    //   label: 'Saved',
    // },
    {
      href: `/profile/${did}`,
      icon: <TbUserCircle size={navbarIconSize} />,
      label: 'Profile',
    },
  ];

  // const menu2 = [
  //   {
  //     href: '/analytics',
  //     icon: <TbChartPie size={navbarIconSize} />,
  //     label: 'Analytics',
  //   },
  //   {
  //     href: '/feed',
  //     icon: <TbUsers size={navbarIconSize} />,
  //     label: 'Subscribers',
  //   },
  // ];

  return (
    <StyledNavBar>
      <div>
        <NavBarLinkContainer>
          {menu.map((item, index) => (
            <NavBarLink
              key={index}
              {...item}
              isCollapsed={collapsed}
              active={router.asPath === item.href}
            />
          ))}

          {did && (
            <NavBarStoriesContainer>
              {collapsed ? (
                <Tooltip delayDuration={600}>
                  <TooltipTrigger asChild>
                    <Link href="/editor/new">
                      <IconButton variant="light" size="lg">
                        <TbPlus />
                      </IconButton>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    Write story
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Flex justify="between" align="center" css={{ pl: '10px' }}>
                  <Flex align="center" gap="2">
                    <TbBook size={navbarIconSize} />
                    <Typography>Stories</Typography>
                    <NumberBadge>{postsNumbers.data?.nbTotal}</NumberBadge>
                  </Flex>
                  <Link href="/editor/new">
                    <IconButton variant="light" size="lg">
                      <TbPlus />
                    </IconButton>
                  </Link>
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
                <Link href="/drafts">
                  <NavBarLinkStoriesButton
                    variant="ghost"
                    active={router.pathname === '/drafts'}
                  >
                    Drafts{' '}
                    <NumberBadge>{postsNumbers.data?.nbDrafts}</NumberBadge>
                  </NavBarLinkStoriesButton>
                </Link>
              )}
            </NavBarStoriesContainer>
          )}
        </NavBarLinkContainer>
      </div>
      {!profile.isLoading && did && (
        <NavBarUserDropdown did={did} profile={profile.data} />
      )}
      {((!profile.isLoading && !did) || skipProfileQuery) && (
        <ConnectDropdown />
      )}
    </StyledNavBar>
  );
};
