import { Container, Flex } from '@radix-ui/themes';
import { useSession } from 'next-auth/react';
import { useUserControllerGetUserMe } from '@/__generated__/sigle-api';
import { HeaderLogo } from '@/components/layout/header/header-logo';
import { HeaderLoggedOut } from '@/components/layout/header/header-logged-out';
import { HeaderLoggedIn } from '@/components/layout/header/header-logged-in';
import { HeaderMobile } from '@/components/layout/header/header-mobile';
import { useAuth } from '../../auth/AuthContext';

export const AppHeader = () => {
  const { user } = useAuth();
  const { status } = useSession();

  /**
   * This query is used to register the user in the DB. As the header is part of all the
   * pages we know this query will run before any operation.
   */
  useUserControllerGetUserMe(
    {},
    {
      enabled: status === 'authenticated',
      staleTime: 0,
      refetchOnMount: false,
    },
  );

  return (
    <header className="w-full">
      <Container className="rt-r-size-5 mt-4 px-5 md:mt-10">
        <div className="flex items-center justify-between">
          <HeaderLogo />

          <Flex className="flex md:hidden" gap="5" align="center">
            <HeaderMobile />
          </Flex>

          <Flex className="hidden md:flex" align="center" gap="7">
            {!user ? <HeaderLoggedOut /> : <HeaderLoggedIn />}
          </Flex>
        </div>
      </Container>
    </header>
  );
};
