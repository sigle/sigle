import { styled } from '@sigle/stitches.config';
import { NavBar } from '../NavBar/NavBar';
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
        gridTemplateColumns: collapsed ? '81px auto' : '271px auto',
        height: '100vh',
      }}
    >
      <NavBar />
      <main>{children}</main>
    </Box>
  );
};
