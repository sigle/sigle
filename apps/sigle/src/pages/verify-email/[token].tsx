import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useEmailVerificationControllerVerifyEmail } from '@/__generated__/sigle-api';
import { AppHeader } from '../../components/layout/header/header';
import { styled } from '../../stitches.config';
import { Button, Container, Flex, Typography } from '../../ui';

const VerifyEmailContainer = styled(Container, {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  flex: 1,
});

const VerifyEmail = () => {
  const router = useRouter();
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { mutate: verifyUserEmail } = useEmailVerificationControllerVerifyEmail(
    {
      onError: (error) => {
        setError(error?.message || 'An error occurred');
      },
      onSuccess: () => {
        setSuccess(true);
      },
    },
  );
  const { token } = router.query;

  useEffect(() => {
    if (token) {
      verifyUserEmail({ body: { token: token as string } });
    }
  }, [token]);

  return (
    <Flex direction="column" css={{ height: '100%' }}>
      <AppHeader />
      <VerifyEmailContainer>
        {success && (
          <>
            <Typography>Email verified successfully!</Typography>
            <Link href="/login" passHref legacyBehavior>
              <Button css={{ mt: '$5' }} as="a" size="lg" color="orange">
                Go back to your dashboard
              </Button>
            </Link>
          </>
        )}
        {error && <Typography css={{ color: '$orange11' }}>{error}</Typography>}
      </VerifyEmailContainer>
    </Flex>
  );
};

export default VerifyEmail;
