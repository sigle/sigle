import { Suspense } from 'react';
import { Text } from '@radix-ui/themes';
import { Protected } from '../../modules/auth/Protected';
import { EmailData } from '../../modules/settings/email/EmailData';
import { SettingsLayout } from '../../modules/settings/SettingsLayout';

const PrivateDataPage = () => {
  return (
    <Protected>
      <Suspense
        fallback={
          <SettingsLayout>
            <Text>Loading ...</Text>
          </SettingsLayout>
        }
      >
        <EmailData />
      </Suspense>
    </Protected>
  );
};

export default PrivateDataPage;
