import type { Meta, StoryObj } from '@storybook/react';
import { Typography } from '@sigle/ui';

const meta: Meta<typeof Typography> = {
  title: 'Typography',
  component: Typography,
  tags: ['autodocs'],
  argTypes: {
    size: {
      defaultValue: 'md',
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'],
    },
    color: {
      defaultValue: 'gray',
      control: 'select',
      options: ['gray', 'indigo'],
    },
    fontWeight: {
      defaultValue: 'normal',
      control: 'select',
      options: ['normal', 'semiBold', 'bold'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Typography>;

export const Default: Story = {
  args: {
    children: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.',
  },
};
