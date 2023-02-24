import { styled } from '@sigle/stitches.config';
import { Flex } from '@sigle/ui';

const StyledNavTitle = styled(Flex, {
  px: '$5',
  borderBottom: '1px solid $gray6',
  backgroundColor: '$gray1',
});

interface NavTitleProps {
  children: React.ReactNode;
}

export const NavTitle = ({ children }: NavTitleProps) => {
  return <StyledNavTitle align="center">{children}</StyledNavTitle>;
};
