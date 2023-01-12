import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@sigle/ui';

const meta: Meta<typeof Button> = {
  title: 'Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      defaultValue: 'solid',
      control: 'select',
      options: ['solid', 'outline', 'ghost'],
    },
    size: {
      defaultValue: 'md',
      control: 'select',
      options: ['sm', 'md', 'lg'],
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
