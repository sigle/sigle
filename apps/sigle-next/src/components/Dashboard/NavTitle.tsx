import { TbMenu2 } from 'react-icons/tb';
import { styled } from '@sigle/stitches.config';
import { Flex, IconButton } from '@sigle/ui';
import { useDashboardStore } from './store';

const StyledNavTitle = styled(Flex, {
  px: '$5',
  borderBottom: '1px solid $gray6',
  backgroundColor: '$gray1',
});

interface NavTitleProps {
  children: React.ReactNode;
}

export const NavTitle = ({ children }: NavTitleProps) => {
  const setOpen = useDashboardStore((state) => state.setOpen);

  return (
    <StyledNavTitle align="center">
      <IconButton
        variant="ghost"
        css={{
          mr: '$4',
          '@md': {
            display: 'none',
          },
        }}
        onClick={() => setOpen(true)}
      >
        <TbMenu2 size={30} />
      </IconButton>
      {children}
    </StyledNavTitle>
  );
};
