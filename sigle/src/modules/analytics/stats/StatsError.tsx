import { CrossCircledIcon } from '@radix-ui/react-icons';
import { Flex, Text } from '../../../ui';

interface StatsErrorProps {
  children: React.ReactNode;
}

export const StatsError = ({ children }: StatsErrorProps) => {
  return (
    <Flex
      align="center"
      gap="3"
      css={{
        color: '$red11',
        backgroundColor: '$red5',
        mb: '$8',
        py: '$3',
        px: '$5',
        br: '$2',
      }}
    >
      <CrossCircledIcon />
      <Text css={{ color: '$red11' }} size="sm">
        {children}
      </Text>
    </Flex>
  );
};
