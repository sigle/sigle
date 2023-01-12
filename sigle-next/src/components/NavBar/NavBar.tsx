import { styled } from '@sigle/stitches.config';
import {
  Button,
  // Typography
} from '@sigle/ui';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  TbHome,
  // TbChevronDown
} from 'react-icons/tb';

const StyledNavBar = styled('nav', {
  px: '$5',
  py: '$8',
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

// const UserMenu = styled('div', {
//   backgroundColor: '$gray3',
//   br: '$xl',
//   display: 'flex',
//   justifyContent: 'space-between',
//   alignItems: 'center',
//   gap: '$2',
//   p: '$3',
// });

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
      href: '/profile',
      icon: <TbHome />,
      label: 'Profile',
    },
  ];

  return (
    <StyledNavBar>
      <div>
        <Image src="/img/logo.png" alt="Logo" height={34} width={93} />
        <Menu>
          {menu.map((item, index) => (
            <NavBarLink
              key={index}
              {...item}
              active={router.pathname === item.href}
            />
          ))}
        </Menu>
      </div>
      {/* <UserMenu>
        <div>
          <Typography size="xs">Marly McKendry</Typography>
          <Typography css={{ color: '$gray9' }} size="xs">
            markendry.btc
          </Typography>
        </div>
        <TbChevronDown />
      </UserMenu> */}
    </StyledNavBar>
  );
};
