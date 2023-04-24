import { styled } from '@sigle/stitches.config';
import { DashboardContent } from './DashboardContent';
import { NavBar } from './NavBar';
import { NavBarTop } from './NavBarTop';
import { NavTitle } from './NavTitle';
import { SidebarContent } from './SidebarContent';
import { useDashboardStore } from './store';
import { MobileNavBar } from './MobileNavBar';

const Box = styled('div', {});

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
      <NavBar />
      <DashboardContent>
        <Box
          css={{
            height: '100%',
            display: 'grid',
            '@md': {
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
