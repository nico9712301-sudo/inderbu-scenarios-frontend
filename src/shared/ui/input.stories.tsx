import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { Search } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'DESIGN SYSTEM/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
    disabled: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

// Default input
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

// Input types
export const Types: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label className="text-sm font-medium mb-2 block">Text</label>
        <Input type="text" placeholder="Enter text" />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Email</label>
        <Input type="email" placeholder="email@example.com" />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Password</label>
        <Input type="password" placeholder="Enter password" />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Number</label>
        <Input type="number" placeholder="Enter number" />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Search</label>
        <Input type="search" placeholder="Search..." />
      </div>
    </div>
  ),
};

// With value
export const WithValue: Story = {
  args: {
    value: 'Pre-filled value',
    readOnly: true,
  },
};

// Disabled
export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

// With icon (using wrapper)
export const WithIcon: Story = {
  render: () => (
    <div className="relative w-80">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input className="pl-10" placeholder="Search..." />
    </div>
  ),
};

// Error state (using className)
export const Error: Story = {
  args: {
    placeholder: 'Invalid input',
    className: 'border-destructive focus-visible:ring-destructive',
  },
};

