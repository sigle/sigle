import type { Meta } from '@storybook/react';
import { TbWorld } from 'react-icons/tb';
import { Input, InputProps } from '@sigle/ui';

const meta: Meta<typeof Input> = {
  title: 'Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      defaultValue: false,
      control: 'boolean',
    },
    rightIcon: {
      defaultValue: false,
      control: 'boolean',
    },
    invalid: {
      defaultValue: false,
      control: 'boolean',
    },
  },
};

export default meta;

export const Default = ({ rightIcon, ...args }: InputProps) => (
  <Input
    {...args}
    rightIcon={rightIcon ? <TbWorld /> : undefined}
    placeholder="Placeholder"
  />
);
