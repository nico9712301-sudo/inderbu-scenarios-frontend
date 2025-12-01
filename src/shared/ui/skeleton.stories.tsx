import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from './skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

// Basic skeleton
export const Basic: Story = {
  render: () => <Skeleton className="h-4 w-[250px]" />,
};

// Different sizes
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Skeleton className="h-4 w-[100px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[300px]" />
      <Skeleton className="h-4 w-[400px]" />
    </div>
  ),
};

// Card skeleton
export const Card: Story = {
  render: () => (
    <div className="flex items-center space-x-4 w-[400px]">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  ),
};

// Article skeleton
export const Article: Story = {
  render: () => (
    <div className="space-y-4 w-[500px]">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-[200px] w-full rounded-lg" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  ),
};

// Avatar skeleton
export const Avatar: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="h-10 w-16 rounded-full" />
      <Skeleton className="h-10 w-20 rounded-full" />
    </div>
  ),
};

// Button skeleton
export const Button: Story = {
  render: () => (
    <div className="flex gap-2">
      <Skeleton className="h-10 w-24 rounded-md" />
      <Skeleton className="h-10 w-24 rounded-md" />
      <Skeleton className="h-10 w-24 rounded-md" />
    </div>
  ),
};

// Table skeleton
export const Table: Story = {
  render: () => (
    <div className="space-y-3 w-[600px]">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  ),
};

