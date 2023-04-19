import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '@sigle/ui';

const meta: Meta<typeof Badge> = {
  title: 'Badge',
  component: Badge,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: '9',
  },
};
