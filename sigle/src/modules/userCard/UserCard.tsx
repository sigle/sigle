import { styled } from '../../stitches.config';
import { Button, Flex, Typography } from '../../ui';
import { generateAvatar } from '../../utils/boringAvatar';

const UserCardContainer = styled('div', {
  display: 'flex',
  borderBottom: '1px solid $colors$gray6',
  px: '$2',
  py: '$3',
});

const ProfileImageContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  br: '$1',
  overflow: 'hidden',
  width: 38,
  height: 38,
  flex: 'none',
});

const ProfileImage = styled('img', {
  width: 'auto',
  height: '100%',
  maxWidth: 38,
  maxHeight: 38,
  objectFit: 'cover',
});

interface UserCardProps {
  userInfo: {
    username: string;
    address: string;
  };
}

export const UserCard = ({ userInfo }: UserCardProps) => {
  return (
    <UserCardContainer>
      <ProfileImageContainer>
        <ProfileImage src={generateAvatar(userInfo.address)} />
      </ProfileImageContainer>
      <Flex css={{ ml: '$5' }} justify="between" align="start">
        <Flex direction="column">
          <Typography size="subheading" css={{ fontWeight: 600 }}>
            {userInfo.address}
          </Typography>
          <Typography
            css={{
              color: '$gray9',
              mt: '$1',
              overflow: 'hidden',
              display: '-webkit-box',
              '-webkit-line-clamp': 2,
              '-webkit-box-orient': 'vertical',
              typographyOverflow: 'ellipsis',
            }}
            size="subheading"
          >
            Lawyer. Civil rights. Mediator. Member in different associations.
            Speaker. Startup Advisor. Lawyer. Civil rights. Mediator. Member in
            different associations. Speaker. Startup Advisor. Lawyer. Civil
            rights. Mediator. Member in different associations. Speaker. Startup
            Advisor.
          </Typography>
        </Flex>
        <Button color="orange" css={{ ml: '$5' }}>
          Follow
        </Button>
      </Flex>
    </UserCardContainer>
  );
};
