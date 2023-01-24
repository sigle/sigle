import { LogoImage } from '@/images/Logo';
import { LogoOnlyImage } from '@/images/LogoOnly';
import { styled } from '@sigle/stitches.config';
import { Flex } from '@sigle/ui';

const StyledNavBar = styled(Flex, {
  px: '$5',
  borderRight: '1px solid $gray6',
});

interface NavBarTopProps {
  collapsed: boolean;
}

export const NavBarTop = ({ collapsed }: NavBarTopProps) => {
  return (
    <StyledNavBar justify={collapsed ? 'center' : 'start'} align="center">
      {collapsed ? <LogoOnlyImage /> : <LogoImage />}
    </StyledNavBar>
  );
};
