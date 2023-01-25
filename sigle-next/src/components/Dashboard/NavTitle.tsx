import { styled } from '@sigle/stitches.config';
import { Flex, Typography } from '@sigle/ui';

const StyledNavTitle = styled(Flex, {
  px: '$5',
  borderBottom: '1px solid $gray6',
});

export const NavTitle = () => {
  return (
    <StyledNavTitle align="center">
      <Typography size="lg" fontWeight="bold">
        Home
      </Typography>
    </StyledNavTitle>
  );
};
