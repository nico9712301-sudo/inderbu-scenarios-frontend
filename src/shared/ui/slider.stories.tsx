import type { Meta, StoryObj } from '@storybook/react';
import { Slider } from './slider';
import React, { useState } from 'react';

const meta: Meta<typeof Slider> = {
  title: 'DESIGN SYSTEM/Slider',
  component: Slider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    defaultValue: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
    max: {
      control: 'number',
    },
    min: {
      control: 'number',
    },
    step: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

// Basic slider
export const Basic: Story = {
  args: {
    defaultValue: [50],
    max: 100,
    step: 1,
  },
};

// With label
export const WithLabel: Story = {
  render: () => {
    const [value, setValue] = useState([50]);
    return (
      <div className="space-y-4 w-[400px]">
        <div className="flex justify-between text-sm">
          <span>Volume</span>
          <span>{value[0]}%</span>
        </div>
        <Slider
          value={value}
          onValueChange={setValue}
          max={100}
          step={1}
        />
      </div>
    );
  },
};

// Range slider
export const Range: Story = {
  render: () => {
    const [value, setValue] = useState([20, 80]);
    return (
      <div className="space-y-4 w-[400px]">
        <div className="flex justify-between text-sm">
          <span>Price Range</span>
          <span>${value[0]} - ${value[1]}</span>
        </div>
        <Slider
          value={value}
          onValueChange={setValue}
          max={100}
          step={1}
        />
      </div>
    );
  },
};

// Different steps
export const Steps: Story = {
  render: () => (
    <div className="space-y-8 w-[400px]">
      <div className="space-y-2">
        <div className="text-sm">Step: 1 (0-100)</div>
        <Slider defaultValue={[50]} max={100} step={1} />
      </div>
      <div className="space-y-2">
        <div className="text-sm">Step: 5 (0-100)</div>
        <Slider defaultValue={[50]} max={100} step={5} />
      </div>
      <div className="space-y-2">
        <div className="text-sm">Step: 10 (0-100)</div>
        <Slider defaultValue={[50]} max={100} step={10} />
      </div>
    </div>
  ),
};

// Disabled
export const Disabled: Story = {
  args: {
    defaultValue: [50],
    disabled: true,
  },
};

// Different ranges
export const DifferentRanges: Story = {
  render: () => (
    <div className="space-y-8 w-[400px]">
      <div className="space-y-2">
        <div className="text-sm">0 - 100</div>
        <Slider defaultValue={[50]} max={100} />
      </div>
      <div className="space-y-2">
        <div className="text-sm">0 - 1000</div>
        <Slider defaultValue={[500]} max={1000} step={10} />
      </div>
      <div className="space-y-2">
        <div className="text-sm">0 - 50</div>
        <Slider defaultValue={[25]} max={50} />
      </div>
    </div>
  ),
};

