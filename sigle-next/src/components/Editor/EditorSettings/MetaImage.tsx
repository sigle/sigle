import { styled } from '@sigle/stitches.config';
import { Button, Typography } from '@sigle/ui';
import { TbCameraPlus } from 'react-icons/tb';

const StyledEmptyFrame = styled('div', {
  height: '200px',
  backgroundColor: '$gray3',
  borderRadius: '$md',
  border: '1px solid $gray8',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const MetaImage = () => {
  return (
    <>
      <Typography size="sm" fontWeight="semiBold">
        Meta title
      </Typography>
      <StyledEmptyFrame>
        <Button size="sm" variant="light" rightIcon={<TbCameraPlus />}>
          Add meta image
        </Button>
      </StyledEmptyFrame>
      <Typography size="xs" color="gray9">
        Add a custom meta image for your social media.
      </Typography>
    </>
  );
};
