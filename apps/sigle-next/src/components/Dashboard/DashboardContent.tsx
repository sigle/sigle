import { Flex } from '@sigle/ui';

interface DashboardContentProps {
  children: React.ReactNode;
}

export const DashboardContent = ({ children }: DashboardContentProps) => {
  return (
    <Flex direction="column" css={{ overflowY: 'scroll' }}>
      {children}
    </Flex>
  );
};
