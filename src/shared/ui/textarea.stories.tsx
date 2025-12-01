import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from './textarea';
import { Label } from './label';

const meta: Meta<typeof Textarea> = {
  title: 'DESIGN SYSTEM/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
    rows: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

// Basic textarea
export const Basic: Story = {
  render: () => (
    <div className="w-[400px] space-y-2">
      <Label htmlFor="message">Message</Label>
      <Textarea id="message" placeholder="Type your message here." />
    </div>
  ),
};

// With default value
export const WithValue: Story = {
  render: () => (
    <div className="w-[400px] space-y-2">
      <Label htmlFor="message-filled">Message</Label>
      <Textarea
        id="message-filled"
        defaultValue="This is a pre-filled textarea with some content."
      />
    </div>
  ),
};

// Disabled
export const Disabled: Story = {
  render: () => (
    <div className="w-[400px] space-y-2">
      <Label htmlFor="message-disabled">Message</Label>
      <Textarea
        id="message-disabled"
        placeholder="Disabled textarea"
        disabled
      />
    </div>
  ),
};

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-[400px]">
      <div className="space-y-2">
        <Label>Small (2 rows)</Label>
        <Textarea placeholder="Small textarea" rows={2} />
      </div>
      <div className="space-y-2">
        <Label>Medium (4 rows)</Label>
        <Textarea placeholder="Medium textarea" rows={4} />
      </div>
      <div className="space-y-2">
        <Label>Large (6 rows)</Label>
        <Textarea placeholder="Large textarea" rows={6} />
      </div>
    </div>
  ),
};

// Error state
export const Error: Story = {
  render: () => (
    <div className="w-[400px] space-y-2">
      <Label htmlFor="message-error" className="text-destructive">
        Message
      </Label>
      <Textarea
        id="message-error"
        placeholder="Invalid input"
        className="border-destructive focus-visible:ring-destructive"
      />
      <p className="text-sm text-destructive">This field is required.</p>
    </div>
  ),
};

