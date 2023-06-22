import { styled } from '@sigle/stitches.config';
import { Flex } from '@sigle/ui';

const SidebarContainer = styled('div', {
  position: 'relative',
  borderLeft: '1px solid $gray6',
});

const StyledSidebarContent = styled('div', {
  pt: '$10',
  px: '$5',
  '@md': {
    py: '$5',
    overflowY: 'scroll',
    position: 'fixed',
    top: 80,
    bottom: 0,
    width: 420,
  },
});

interface SidebarContentProps {
  children: React.ReactNode;
}

export const SidebarContent = ({ children }: SidebarContentProps) => {
  return (
    <SidebarContainer>
      <StyledSidebarContent>
        <Flex direction="column">{children}</Flex>
      </StyledSidebarContent>
    </SidebarContainer>
  );
};
