import { styled } from '@sigle/stitches.config';
import { NavBar } from '../NavBar/NavBar';

const Box = styled('div', {});

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navBarCollapsed = true;

  return (
    <Box
      css={{
        display: 'grid',
        gridTemplateColumns: '270px auto',
        height: '100vh',
      }}
    >
      <NavBar />
      <main>{children}</main>
    </Box>
  );
};
