import { EyeOpenIcon as EyeOpenIconBase } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { styled } from '../../../stitches.config';
import { Button as ButtonBase, Container, Flex, Text } from '../../../ui';
import { useAuth } from '../../auth/AuthContext';
import { Logo } from './Logo';

const Header = styled('header', Container, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  mt: '$10',
  mb: '$20',
});

const Nav = styled('nav', Flex, {
  gap: '$10',
});

const EyeOpenIcon = styled(EyeOpenIconBase, {
  display: 'inline-block',
});

const StatusDot = styled('div', {
  backgroundColor: '#37C391',
  width: '$2',
  height: '$2',
  borderRadius: '$round',
});

const Button = styled('a', ButtonBase);

export const AppHeader = () => {
  const { user } = useAuth();
  const router = useRouter();

  if (router.pathname === '/login') {
    return null;
  }

  return (
    <Header>
      <Nav align="center">
        <Link href="/" passHref>
          <a>
            <Logo />
          </a>
        </Link>
        {user && (
          <Link href="/" passHref>
            <a>
              <Text css={{ mr: '$2', display: 'inline-block' }}>
                Visit my blog
              </Text>
              <EyeOpenIcon />
            </a>
          </Link>
        )}
      </Nav>
      {user && (
        <Flex align="center" gap="10">
          <Flex gap="1" align="center">
            <StatusDot />
            <Text>{user.username}</Text>
          </Flex>
          <Link href="/" passHref>
            <Button size="lg">Write a story</Button>
          </Link>
        </Flex>
      )}
    </Header>
  );
};
