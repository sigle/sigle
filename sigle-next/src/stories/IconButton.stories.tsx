import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from '@sigle/ui';
import { TbCurrencyBitcoin } from 'react-icons/tb';

const meta: Meta<typeof IconButton> = {
  title: 'IconButton',
  component: IconButton,
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
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default = (args: Story) => (
  <IconButton {...args}>
    <TbCurrencyBitcoin />
  </IconButton>
);
