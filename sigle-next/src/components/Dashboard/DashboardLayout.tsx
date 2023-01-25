import { styled } from '@sigle/stitches.config';
import { DashboardContent } from './DashboardContent';
import { NavBar } from './NavBar';
import { NavBarTop } from './NavBarTop';
import { NavTitle } from './NavTitle';
import { SidebarContent } from './SidebarContent';
import { useDashboardStore } from './store';

const Box = styled('div', {});

interface DashboardLayoutProps {
  sidebarContent?: React.ReactNode;
  children: React.ReactNode;
}

export const DashboardLayout = ({
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
        gridTemplateColumns: collapsed ? '81px 1fr' : '271px 1fr',
      }}
    >
      <NavBarTop collapsed={collapsed} />
      <NavTitle />
      <NavBar />
      <DashboardContent>
        <Box
          css={{
            display: 'grid',
            gridTemplateColumns: '1fr 420px',
          }}
        >
          {children}
          {sidebarContent ? (
            <SidebarContent>{sidebarContent}</SidebarContent>
          ) : null}
        </Box>
      </DashboardContent>
    </Box>
  );
};
