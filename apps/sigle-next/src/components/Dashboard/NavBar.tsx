import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  TbBook,
  TbHome,
  TbNotebook,
  TbPlus,
  TbUserCircle,
} from 'react-icons/tb';
import { useSession } from 'next-auth/react';
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
import { useAuthModal } from '../AuthModal/AuthModal';
import { useDashboardStore } from './store';
import { NavBarUserDropdown } from './NavBar/UserDropdown';
import { ConnectDropdown } from './NavBar/ConnectDropdown';

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
  const { setOpen } = useAuthModal();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href === '/connect') {
      e.preventDefault();
      e.stopPropagation();
      setOpen(true);
    }
  };

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
            onClick={handleLinkClick}
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
    <Link href={href} onClick={handleLinkClick}>
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
  const { data: session } = useSession();

  const did = session?.user?.did;
  const skipProfileQuery = !did;
  const profile = trpc.user.userProfile.useQuery(
    { did: did ?? '' },
    { enabled: !skipProfileQuery },
  );

  const postsNumbers = trpc.post.postsNumbers.useQuery(
    { did: did ?? '' },
    { enabled: !skipProfileQuery },
  );

  const menu = [
    {
      href: '/',
      icon: <TbHome size={navbarIconSize} />,
      label: 'Home',
    },
    // {
    //   href: '/feed',
    //   icon: <TbMail size={navbarIconSize} />,
    //   label: 'Inbox',
    // },
    // {
    //   href: '/saved',
    //   icon: <TbBookmarks size={navbarIconSize} />,
    //   label: 'Saved',
    // },
    {
      href: did ? `/profile/${did}` : '/connect',
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
    <>
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
                        <TbPlus size={navbarIconSize} />
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
    </>
  );
};
