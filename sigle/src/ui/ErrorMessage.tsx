import { CrossCircledIcon } from '@radix-ui/react-icons';
import { CSS } from '../stitches.config';
import { Flex } from '.';
import { Typography } from './Typography';

interface ErrorProps {
  children: React.ReactNode;
  css?: CSS;
}

export const ErrorMessage = ({ children, ...props }: ErrorProps) => {
  return (
    <Flex
      {...props}
      align="center"
      gap="3"
      css={{
        color: '$red11',
        backgroundColor: '$red5',
        mb: '$8',
        py: '$3',
        px: '$5',
        br: '$2',
        ...props.css,
      }}
    >
      <CrossCircledIcon />
      <Typography css={{ color: '$red11' }} size="subheading">
        {children}
      </Typography>
    </Flex>
  );
};
