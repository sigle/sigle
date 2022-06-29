import { styled } from '../../stitches.config';
import { Button, Flex, Typography } from '../../ui';
import { generateAvatar } from '../../utils/boringAvatar';

const UserCardContainer = styled('div', {
  display: 'flex',
  borderBottom: '1px solid $colors$gray6',
  py: '$3',
  gap: '$5',
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

const UserCardDescription = styled(Typography, {
  mt: '$1',
  overflow: 'hidden',
  display: '-webkit-box',
  '-webkit-line-clamp': 2,
  '-webkit-box-orient': 'vertical',
  typographyOverflow: 'ellipsis',
  maxWidth: 600,
});

interface UserCardProps {
  address: string;
}

export const UserCard = ({ address }: UserCardProps) => {
  // TODO fetch info from stacks api

  return (
    <UserCardContainer>
      <ProfileImageContainer>
        <ProfileImage src={generateAvatar(address)} />
      </ProfileImageContainer>
      <Flex css={{ width: '100%' }} direction="column">
        <Flex justify="between" align="center">
          <Typography
            size="subheading"
            css={{
              fontWeight: 600,
            }}
          >
            {address}
          </Typography>
          <Button color="orange" css={{ ml: '$5' }}>
            Follow
          </Button>
        </Flex>
        <UserCardDescription size="subheading" css={{ color: '$gray9' }}>
          Lawyer. Civil rights. Mediator. Member in different associations.
          Speaker. Startup Advisor. Lawyer. Civil rights. Mediator. Member in
          different associations. Speaker. Startup Advisor. Lawyer. Civil
          rights. Mediator. Member in different associations. Speaker. Startup
          Advisor.
        </UserCardDescription>
      </Flex>
    </UserCardContainer>
  );
};
