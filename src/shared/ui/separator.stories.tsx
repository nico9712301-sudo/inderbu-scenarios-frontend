import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from './separator';

const meta: Meta<typeof Separator> = {
  title: 'DESIGN SYSTEM/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Separator>;

// Horizontal separator
export const Horizontal: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <div>
        <h4 className="text-sm font-medium">Section 1</h4>
        <p className="text-sm text-muted-foreground">
          Content for section 1 goes here.
        </p>
      </div>
      <Separator />
      <div>
        <h4 className="text-sm font-medium">Section 2</h4>
        <p className="text-sm text-muted-foreground">
          Content for section 2 goes here.
        </p>
      </div>
    </div>
  ),
};

// Vertical separator
export const Vertical: Story = {
  render: () => (
    <div className="flex h-5 items-center gap-4">
      <div>Home</div>
      <Separator orientation="vertical" />
      <div>About</div>
      <Separator orientation="vertical" />
      <div>Contact</div>
    </div>
  ),
};

// In menu
export const InMenu: Story = {
  render: () => (
    <div className="w-[200px] space-y-2 rounded-lg border p-4">
      <div className="text-sm font-medium">Settings</div>
      <div className="text-sm text-muted-foreground">Account</div>
      <Separator />
      <div className="text-sm font-medium">Preferences</div>
      <div className="text-sm text-muted-foreground">Theme</div>
      <Separator />
      <div className="text-sm font-medium">Help</div>
      <div className="text-sm text-muted-foreground">Support</div>
    </div>
  ),
};

// Multiple separators
export const Multiple: Story = {
  render: () => (
    <div className="w-[400px] space-y-4">
      <div>
        <h4 className="text-sm font-medium">First Section</h4>
        <p className="text-sm text-muted-foreground">Content 1</p>
      </div>
      <Separator />
      <div>
        <h4 className="text-sm font-medium">Second Section</h4>
        <p className="text-sm text-muted-foreground">Content 2</p>
      </div>
      <Separator />
      <div>
        <h4 className="text-sm font-medium">Third Section</h4>
        <p className="text-sm text-muted-foreground">Content 3</p>
      </div>
    </div>
  ),
};

