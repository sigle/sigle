import { styled } from '../../stitches.config';

const ProfileImageContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  br: '$1',
  overflow: 'hidden',
  width: 18,
  height: 18,
});

const ProfileImage = styled('img', {
  width: 'auto',
  height: '100%',
  maxWidth: 18,
  maxHeight: 18,
  objectFit: 'cover',
});

interface StoryCardProfileImageProps {
  image: string;
}

export const StoryCardProfileImage = ({
  image,
}: StoryCardProfileImageProps) => {
  return (
    <ProfileImageContainer>
      <ProfileImage src={image} />
    </ProfileImageContainer>
  );
};
