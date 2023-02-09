import Link from 'next/link';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Badge, Button, Flex, Typography } from '@sigle/ui';
import { useCeramic } from '@/components/Ceramic/CeramicProvider';
import { DashboardLayout } from '@/components/Dashboard/DashboardLayout';
import { TbBrandTwitter, TbLink } from 'react-icons/tb';
import { addressAvatar } from '@/utils';
import { styled } from '@sigle/stitches.config';

const AvatarContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'center',
  overflow: 'hidden',
  width: 72,
  height: 72,
  br: '$sm',
});

const ProfilePage = () => {
  return (
    <DashboardLayout
      sidebarContent={
        <>
          <Flex justify="between">
            <AvatarContainer>
              <img src={addressAvatar('TODO', 72)} alt="user avatar" />
            </AvatarContainer>
            <Link href="/settings">
              <Button variant="light" size="sm">
                Edit profile
              </Button>
            </Link>
          </Flex>

          <Flex gap="3" align="center" css={{ mt: '$2' }}>
            <Typography size="lg" fontWeight="semiBold">
              Motoki Tonn
            </Typography>
            <Badge>motoki.btc</Badge>
          </Flex>

          <Flex gap="3" css={{ mt: '$3' }}>
            <Typography size="sm">
              106{' '}
              <Typography as="span" size="sm" color="gray9">
                Following
              </Typography>
            </Typography>
            <Typography size="sm">
              3,209{' '}
              <Typography as="span" size="sm" color="gray9">
                Followers
              </Typography>
            </Typography>
          </Flex>

          <Typography size="sm" color="gray9" css={{ mt: '$3' }}>
            Writer and novelist. Bestselling author of “AI will change the
            world”. Lover of coffee, books, and the written word. Always on the
            lookout for new stories to tell. Can't stop the feeling that time is
            going faster.
          </Typography>

          <Flex gap="3" css={{ mt: '$5' }} align="center">
            <Link href="https://www.sigle.io" target="_blank">
              <Flex align="center" gap="1">
                <Typography size="sm" color="gray9">
                  <TbLink size={16} />
                </Typography>
                <Typography size="sm" color="indigo">
                  www.sigle.io
                </Typography>
              </Flex>
            </Link>
            <Link href="https://www.sigle.io" target="_blank">
              <Typography size="sm">
                <TbBrandTwitter fill="currentColor" stroke="0" size={16} />
              </Typography>
            </Link>
          </Flex>
        </>
      }
      headerContent={
        <Flex justify="between" css={{ flex: 1 }}>
          <Typography size="xl" fontWeight="bold">
            Profile
          </Typography>
          <Link href="/editor/new">
            <Button>Write story</Button>
          </Link>
        </Flex>
      }
    >
      TODO
    </DashboardLayout>
  );
};

export default function ProtectedProfilePage() {
  // TODO auth protect
  const { session } = useCeramic();

  return <TooltipProvider>{session ? <ProfilePage /> : null}</TooltipProvider>;
}
