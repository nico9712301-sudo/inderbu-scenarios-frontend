import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './badge';

const meta: Meta<typeof Badge> = {
  title: 'DESIGN SYSTEM/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

// Default badge
export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
  },
};

// All variants
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

// With different content
export const Content: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Badge>New</Badge>
      <Badge variant="secondary">Featured</Badge>
      <Badge variant="destructive">Hot</Badge>
      <Badge variant="outline">Sale</Badge>
      <Badge>123</Badge>
      <Badge variant="secondary">Premium</Badge>
    </div>
  ),
};

// Long text
export const LongText: Story = {
  args: {
    children: 'This is a longer badge text',
  },
};

