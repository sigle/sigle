import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@sigle/ui';

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
    disabled: {
      defaultValue: false,
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};
