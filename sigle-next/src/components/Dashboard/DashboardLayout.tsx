import { styled } from '@sigle/stitches.config';
import { NavBar } from './NavBar/NavBar';
import { NavBarTop } from './NavBarTop';
import { NavTitle } from './NavTitle';
import { useDashboardStore } from './store';

const Box = styled('div', {});

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
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
      {children}
    </Box>
  );
};
