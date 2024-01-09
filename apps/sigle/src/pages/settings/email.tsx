import { Suspense } from 'react';
import { Protected } from '../../components/authentication/protected';
import { EmailData } from '../../modules/settings/email/EmailData';
import { SettingsLayout } from '../../modules/settings/SettingsLayout';
import { Typography } from '../../ui';

const PrivateDataPage = () => {
  return (
    <Protected>
      <Suspense
        fallback={
          <SettingsLayout>
            <Typography>Loading ...</Typography>
          </SettingsLayout>
        }
      >
        <EmailData />
      </Suspense>
    </Protected>
  );
};

export default PrivateDataPage;
