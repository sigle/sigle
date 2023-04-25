import { styled } from '@sigle/stitches.config';
import { Box } from '@sigle/ui';
import { DashboardContent } from './DashboardContent';
import { NavBar } from './NavBar';
import { NavBarTop } from './NavBarTop';
import { NavTitle } from './NavTitle';
import { SidebarContent } from './SidebarContent';
import { useDashboardStore } from './store';
import { MobileNavBar } from './MobileNavBar';

const StyledNavBar = styled('nav', {
  px: '$5',
  py: '$5',
  display: 'none',
  flexDirection: 'column',
  backgroundColor: '$gray1',
  justifyContent: 'space-between',
  borderStyle: 'solid',
  borderRightWidth: '1px',
  borderColor: '$gray6',
  '@md': {
    display: 'flex',
  },
});

interface DashboardLayoutProps {
  headerContent?: React.ReactNode;
  sidebarContent?: React.ReactNode;
  children: React.ReactNode;
}

export const DashboardLayout = ({
  headerContent,
  sidebarContent,
  children,
}: DashboardLayoutProps) => {
  const collapsed = useDashboardStore((state) => state.collapsed);

  return (
    <Box
      css={{
        display: 'grid',
        height: '100vh',
        gridTemplateRows: '80px 1fr',
        gridTemplateColumns: '1fr',
        '@md': {
          gridTemplateColumns: collapsed ? '81px 1fr' : '271px 1fr',
        },
      }}
    >
      <NavBarTop collapsed={collapsed} />
      <NavTitle>{headerContent}</NavTitle>
      <StyledNavBar>
        <NavBar />
      </StyledNavBar>
      <DashboardContent>
        <Box
          css={{
            display: 'flex',
            flexDirection: 'column-reverse',
            '@md': {
              height: '100%',
              display: 'grid',
              gridTemplateColumns: '1fr 420px',
            },
          }}
        >
          {children}
          {sidebarContent ? (
            <SidebarContent>{sidebarContent}</SidebarContent>
          ) : null}
        </Box>
      </DashboardContent>
      <MobileNavBar />
    </Box>
  );
};
