import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

const meta: Meta<typeof Tabs> = {
  title: 'DESIGN SYSTEM/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

// Basic tabs
export const Basic: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        Make changes to your account here.
      </TabsContent>
      <TabsContent value="password">
        Change your password here.
      </TabsContent>
    </Tabs>
  ),
};

// Multiple tabs
export const Multiple: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[600px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <h3 className="text-lg font-semibold">Overview</h3>
        <p>View your account overview and summary.</p>
      </TabsContent>
      <TabsContent value="analytics" className="space-y-4">
        <h3 className="text-lg font-semibold">Analytics</h3>
        <p>View detailed analytics and metrics.</p>
      </TabsContent>
      <TabsContent value="reports" className="space-y-4">
        <h3 className="text-lg font-semibold">Reports</h3>
        <p>Generate and view reports.</p>
      </TabsContent>
      <TabsContent value="notifications" className="space-y-4">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <p>Manage your notification settings.</p>
      </TabsContent>
    </Tabs>
  ),
};

// Vertical tabs (using className)
export const Vertical: Story = {
  render: () => (
    <Tabs defaultValue="tab1" orientation="vertical" className="flex gap-4">
      <TabsList className="flex-col h-auto">
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3</TabsTrigger>
      </TabsList>
      <div>
        <TabsContent value="tab1">Content for Tab 1</TabsContent>
        <TabsContent value="tab2">Content for Tab 2</TabsContent>
        <TabsContent value="tab3">Content for Tab 3</TabsContent>
      </div>
    </Tabs>
  ),
};

// With cards
export const WithCards: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </TabsContent>
      <TabsContent value="password" className="rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-2">Password Settings</h3>
        <p className="text-sm text-muted-foreground">
          Change your password and security settings.
        </p>
      </TabsContent>
    </Tabs>
  ),
};

