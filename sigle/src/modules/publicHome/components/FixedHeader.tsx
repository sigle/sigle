import { styled } from '../../../stitches.config';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Flex,
  Typography,
} from '../../../ui';
import {
  useGetUserFollowing,
  useUserFollow,
  useUserUnfollow,
} from '../../../hooks/appData';
import { useFeatureFlags } from '../../../utils/featureFlags';
import { useAuth } from '../../auth/AuthContext';
import { generateAvatar } from '../../../utils/boringAvatar';
import { SettingsFile } from '../../../types';
import { HeaderDropdown } from '../../layout/components/HeaderDropdown';
import { useState } from 'react';
import Link from 'next/link';

const Header = styled('header', Container, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
});

const ImageContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  width: 24,
  height: 24,
  br: '$1',
});

interface FixedHeaderProps {
  userInfo: { username: string; address: string };
  settings: SettingsFile;
  // scrollY: number;
}

export const FixedHeader = ({
  userInfo,
  settings,
}: // scrollY,
FixedHeaderProps) => {
  const { user } = useAuth();
  const { isExperimentalFollowEnabled } = useFeatureFlags();
  const { data: userFollowing } = useGetUserFollowing({
    enabled: !!user && userInfo.username !== user.username,
  });
  const { mutate: followUser } = useUserFollow();
  const { mutate: unfollowUser } = useUserUnfollow();
  const [showLoginPromptDialog, setShowLoginPromptDialog] = useState(false);

  const handleShowLoginPrompt = () => setShowLoginPromptDialog(true);
  const handleCloseLoginPrompt = () => setShowLoginPromptDialog(false);

  const handleFollow = async () => {
    if (!userFollowing) return;
    followUser({ userFollowing, address: userInfo.address });
  };

  const handleUnfollow = async () => {
    if (!userFollowing) {
      return;
    }
    unfollowUser({ userFollowing, address: userInfo.address });
  };

  const userAddress =
    user?.profile.stxAddress.mainnet || user?.profile.stxAddress;

  const isFollowingUser =
    userFollowing && !!userFollowing.following[userInfo.address];

  const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;

  return (
    <Header
      css={{
        backgroundColor: '$gray1',
        position: 'sticky',
        top: 0,
        transform: scrollY > 228 ? 'none' : 'translateY(-200px)',
        // the check below reduces the delayed effect of the exiting fixed header when scrolling up fast - temp solution
        transition: scrollY > 1 ? 'transform 0.5s ease-in-out' : 'none',
        boxShadow: scrollY < 228 ? 'none' : '0 1px 0 0 $colors$gray6',
        py: '$2',
        height: scrollY > 228 ? '100%' : 0,
      }}
    >
      {isExperimentalFollowEnabled && user?.username !== userInfo.username ? (
        <Flex
          css={{
            alignItems: 'center',
            gap: '$5',
          }}
        >
          <ImageContainer
            css={{
              width: 44,
              height: 44,
              br: '$3',
            }}
          >
            <Box
              as="img"
              src={
                settings?.siteLogo
                  ? settings.siteLogo
                  : generateAvatar(userAddress)
              }
              css={{
                width: 'auto',
                height: '100%',
                maxWidth: 44,
                maxHeight: 44,
                objectFit: 'cover',
              }}
            />
          </ImageContainer>
          {!user || userFollowing ? (
            !isFollowingUser ? (
              <Button
                color="orange"
                onClick={user ? handleFollow : handleShowLoginPrompt}
              >
                Follow
              </Button>
            ) : (
              <Button variant="subtle" onClick={handleUnfollow}>
                Unfollow
              </Button>
            )
          ) : null}
        </Flex>
      ) : (
        <Box />
      )}
      {user ? <HeaderDropdown /> : null}
      <Dialog
        open={showLoginPromptDialog}
        onOpenChange={handleCloseLoginPrompt}
      >
        <DialogContent
          css={{
            display: 'flex',
            flexDirection: 'column',
            p: '$8',
            gap: '$8',
            maxWidth: 514,
            br: '$3',
          }}
        >
          <Flex direction="column" gap="3">
            <DialogTitle asChild>
              <Typography size="h3" css={{ fontWeight: 600, mt: '$8' }}>
                Login to continue
              </Typography>
            </DialogTitle>
            <DialogDescription>
              To follow writers on Sigle, you must first be connected. <br /> Go
              to the login page?
            </DialogDescription>
          </Flex>
          <Flex justify="end" gap="5">
            <Button variant="ghost" size="lg" onClick={handleCloseLoginPrompt}>
              Cancel
            </Button>
            <Link href="/login" passHref>
              <Button color="orange" size="lg" as="a">
                Yes, go to login page
              </Button>
            </Link>
          </Flex>
        </DialogContent>
      </Dialog>
    </Header>
  );
};
