import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '@sigle/ui';

const meta: Meta<typeof Textarea> = {
  title: 'Textarea',
  component: Textarea,
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      defaultValue: false,
      control: 'boolean',
    },
    invalid: {
      defaultValue: false,
      control: 'boolean',
    },
    placeholder: {
      defaultValue: 'Placeholder',
      control: 'text',
    },
    rows: {
      defaultValue: 4,
      control: 'number',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};
