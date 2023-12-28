import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, Text, Flex, Container } from '@radix-ui/themes';
import { useEmailVerificationControllerVerifyEmail } from '@/__generated__/sigle-api';
import { AppHeader } from '../../components/layout/header/header';

const VerifyEmail = () => {
  const router = useRouter();
  const [success, setSuccess] = useState<boolean>(true);
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
    <Flex direction="column" className="h-full">
      <AppHeader />
      <Container size="3" px="4" className="mt-10">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          {success && (
            <>
              <Text>Email verified successfully!</Text>
              <Button size="2" color="gray" highContrast asChild>
                <Link href="/" className="mt-4">
                  Go back to your dashboard
                </Link>
              </Button>
            </>
          )}
          {error && <Text color="orange">{error}</Text>}
        </div>
      </Container>
    </Flex>
  );
};

export default VerifyEmail;
