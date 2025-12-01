import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from './progress';
import React, { useState } from 'react';
import { Button } from './button';

const meta: Meta<typeof Progress> = {
  title: 'DESIGN SYSTEM/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

// Basic progress
export const Basic: Story = {
  args: {
    value: 33,
  },
};

// Different values
export const Values: Story = {
  render: () => (
    <div className="space-y-4 w-[400px]">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>0%</span>
        </div>
        <Progress value={0} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>25%</span>
        </div>
        <Progress value={25} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>50%</span>
        </div>
        <Progress value={50} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>75%</span>
        </div>
        <Progress value={75} />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>100%</span>
        </div>
        <Progress value={100} />
      </div>
    </div>
  ),
};

// Animated progress
export const Animated: Story = {
  render: () => {
    const [progress, setProgress] = useState(0);

    const handleStart = () => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);
    };

    const handleReset = () => {
      setProgress(0);
    };

    return (
      <div className="space-y-4 w-[400px]">
        <Progress value={progress} />
        <div className="flex gap-2">
          <Button onClick={handleStart} size="sm">
            Start
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            Reset
          </Button>
        </div>
      </div>
    );
  },
};

// With label
export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2 w-[400px]">
      <div className="flex justify-between text-sm">
        <span>Upload Progress</span>
        <span>65%</span>
      </div>
      <Progress value={65} />
    </div>
  ),
};

