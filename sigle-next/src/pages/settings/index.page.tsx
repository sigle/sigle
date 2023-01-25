import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { styled } from '@sigle/stitches.config';
import { Container, Flex, Typography } from '@sigle/ui';

const TitleRow = styled('div', {
  py: '$5',
});

const SettingsRow = styled(Flex, {
  py: '$5',
  borderTop: '1px solid $gray6',
  justifyContent: 'space-between',
  gap: '$2',
  display: 'grid',
  gridTemplateColumns: '1fr',
  '@md': {
    gridTemplateColumns: '1fr 2fr',
  },
});

const Input = styled('input', {
  color: '$gray11',
  border: '1px solid $gray8',
  backgroundColor: '$gray1',
  borderRadius: '$sm',
  fontSize: '$sm',
  lineHeight: '$sm',
  py: '$2',
  px: '$3',
  outline: 'none',
  transition: 'all 75ms $ease-in',

  '::placeholder': {
    color: '$gray8',
  },

  '&:hover': {
    border: '1px solid $gray9',
  },

  '&:focus': {
    border: '1px solid $indigo8',
    boxShadow: '0px 0px 0px 3px rgba(145, 139, 255, 0.3)',
  },
});

const Textarea = styled('textarea', {
  color: '$gray11',
  border: '1px solid $gray8',
  backgroundColor: '$gray1',
  borderRadius: '$sm',
  fontSize: '$sm',
  lineHeight: '$sm',
  py: '$2',
  px: '$3',
  outline: 'none',
  transition: 'all 75ms $ease-in',

  '::placeholder': {
    color: '$gray8',
  },

  '&:hover': {
    border: '1px solid $gray9',
  },

  '&:focus': {
    border: '1px solid $indigo8',
    boxShadow: '0px 0px 0px 3px rgba(145, 139, 255, 0.3)',
  },
});

const Settings = () => {
  return (
    <DashboardLayout
      headerContent={
        <Typography size="xl" fontWeight="bold">
          Settings
        </Typography>
      }
    >
      <Container css={{ maxWidth: 770, py: '$5' }}>
        <TitleRow>
          <Typography size="xl" fontWeight="bold">
            My profile
          </Typography>
          <Typography size="sm" color="gray9">
            Customize your profile to be recognized on Sigle
          </Typography>
        </TitleRow>
        <SettingsRow>
          <Typography size="sm" fontWeight="semiBold">
            Public name
          </Typography>
          <Flex direction="column" gap="2">
            <Input />
            <Typography size="xs" color="gray9">
              This name will be displayed on your profile page
            </Typography>
          </Flex>
        </SettingsRow>
        <SettingsRow justify="between">
          <Typography size="sm" fontWeight="semiBold">
            Present yourself
          </Typography>
          <Flex direction="column" gap="2">
            <Textarea rows={4} />
            <Typography size="xs" color="gray9">
              Max. 350 characters
            </Typography>
          </Flex>
        </SettingsRow>

        <TitleRow>
          <Typography size="xl" fontWeight="bold">
            Social links
          </Typography>
          <Typography size="sm" color="gray9">
            Add links to your social networks to be displayed on your profile
          </Typography>
        </TitleRow>
      </Container>
    </DashboardLayout>
  );
};

export default function ProtectedSettings() {
  // TODO auth protect
  const { session } = useCeramic();

  return <TooltipProvider>{session ? <Settings /> : null}</TooltipProvider>;
}
