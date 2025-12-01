import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { Download, Heart, Mail, Plus, Search } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'DESIGN SYSTEM/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Default variant
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  },
};

// All variants
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

// All sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  ),
};

// With icons
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
      <Button variant="outline">
        <Mail className="mr-2 h-4 w-4" />
        Send Email
      </Button>
      <Button variant="secondary">
        <Heart className="mr-2 h-4 w-4" />
        Favorite
      </Button>
      <Button variant="ghost">
        <Search className="mr-2 h-4 w-4" />
        Search
      </Button>
    </div>
  ),
};

// Disabled states
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button disabled>Disabled Default</Button>
      <Button variant="destructive" disabled>
        Disabled Destructive
      </Button>
      <Button variant="outline" disabled>
        Disabled Outline
      </Button>
      <Button variant="secondary" disabled>
        Disabled Secondary
      </Button>
    </div>
  ),
};

// Icon only buttons
export const IconOnly: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button size="icon" variant="default">
        <Plus className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="outline">
        <Search className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost">
        <Heart className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="destructive">
        <Download className="h-4 w-4" />
      </Button>
    </div>
  ),
};

