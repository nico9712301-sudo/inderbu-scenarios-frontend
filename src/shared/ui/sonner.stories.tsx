import type { Meta, StoryObj } from '@storybook/react';
import { Toaster } from './sonner';
import { Button } from './button';
import { toast } from 'sonner';

const meta: Meta<typeof Toaster> = {
  title: 'UI/Sonner',
  component: Toaster,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster />
      </>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Toaster>;

// Basic toast
export const Basic: Story = {
  render: () => (
    <Button
      onClick={() => {
        toast('Event has been created');
      }}
    >
      Show Toast
    </Button>
  ),
};

// Success toast
export const Success: Story = {
  render: () => (
    <Button
      onClick={() => {
        toast.success('Profile updated successfully');
      }}
    >
      Show Success
    </Button>
  ),
};

// Error toast
export const Error: Story = {
  render: () => (
    <Button
      variant="destructive"
      onClick={() => {
        toast.error('Failed to save changes');
      }}
    >
      Show Error
    </Button>
  ),
};

// Warning toast
export const Warning: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => {
        toast.warning('Please review your changes');
      }}
    >
      Show Warning
    </Button>
  ),
};

// Info toast
export const Info: Story = {
  render: () => (
    <Button
      variant="outline"
      onClick={() => {
        toast.info('New update available');
      }}
    >
      Show Info
    </Button>
  ),
};

// With description
export const WithDescription: Story = {
  render: () => (
    <Button
      onClick={() => {
        toast('Event has been created', {
          description: 'Monday, January 3rd at 6:00pm',
        });
      }}
    >
      Show Toast with Description
    </Button>
  ),
};

// With action
export const WithAction: Story = {
  render: () => (
    <Button
      onClick={() => {
        toast('Event has been created', {
          description: 'Monday, January 3rd at 6:00pm',
          action: {
            label: 'Undo',
            onClick: () => console.log('Undo'),
          },
        });
      }}
    >
      Show Toast with Action
    </Button>
  ),
};

// All types
export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button
        onClick={() => {
          toast('Default toast message');
        }}
      >
        Default
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          toast.success('Success message');
        }}
      >
        Success
      </Button>
      <Button
        variant="destructive"
        onClick={() => {
          toast.error('Error message');
        }}
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          toast.warning('Warning message');
        }}
      >
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          toast.info('Info message');
        }}
      >
        Info
      </Button>
    </div>
  ),
};

