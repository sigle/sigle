import { styled } from '@sigle/stitches.config';
import { NavBar } from '../NavBar/NavBar';

const Box = styled('div', {});

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const isCollapsed = true;

  return (
    <Box
      css={{
        display: 'grid',
        gridTemplateColumns: isCollapsed ? '81px auto' : '271px auto',
        height: '100vh',
      }}
    >
      <NavBar isCollapsed={isCollapsed} />
      <main>{children}</main>
    </Box>
  );
};
