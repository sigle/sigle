import type { Meta } from '@storybook/react';
import { TbPlus } from 'react-icons/tb';
import { Button, ButtonProps } from '@sigle/ui';

const meta: Meta<typeof Button> = {
  title: 'Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    size: {
      defaultValue: 'md',
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      defaultValue: 'solid',
      control: 'select',
      options: ['solid', 'light', 'outline', 'ghost'],
    },
    color: {
      defaultValue: 'gray',
      control: 'select',
      options: ['gray', 'indigo'],
    },
    disabled: {
      defaultValue: false,
      control: 'boolean',
    },
    leftIcon: {
      defaultValue: false,
      control: 'boolean',
    },
    rightIcon: {
      defaultValue: false,
      control: 'boolean',
    },
  },
};

export default meta;

export const Default = ({ leftIcon, rightIcon, ...args }: ButtonProps) => (
  <Button
    {...args}
    leftIcon={leftIcon ? <TbPlus /> : undefined}
    rightIcon={rightIcon ? <TbPlus /> : undefined}
  >
    Button
  </Button>
);
