import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Label } from './label';

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

// Basic radio group
export const Basic: Story = {
  render: () => (
    <RadioGroup defaultValue="comfortable">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="default" id="r1" />
        <Label htmlFor="r1">Default</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="comfortable" id="r2" />
        <Label htmlFor="r2">Comfortable</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="compact" id="r3" />
        <Label htmlFor="r3">Compact</Label>
      </div>
    </RadioGroup>
  ),
};

// Horizontal layout
export const Horizontal: Story = {
  render: () => (
    <RadioGroup defaultValue="option-one" className="flex gap-6">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="h1" />
        <Label htmlFor="h1">Option One</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="h2" />
        <Label htmlFor="h2">Option Two</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-three" id="h3" />
        <Label htmlFor="h3">Option Three</Label>
      </div>
    </RadioGroup>
  ),
};

// Disabled
export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option-one" disabled>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="d1" />
        <Label htmlFor="d1">Option One</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="d2" />
        <Label htmlFor="d2">Option Two</Label>
      </div>
    </RadioGroup>
  ),
};

// With descriptions
export const WithDescriptions: Story = {
  render: () => (
    <RadioGroup defaultValue="free">
      <div className="flex items-start space-x-2">
        <RadioGroupItem value="free" id="free" className="mt-1" />
        <div className="space-y-1">
          <Label htmlFor="free">Free</Label>
          <p className="text-sm text-muted-foreground">
            Free plan with limited features
          </p>
        </div>
      </div>
      <div className="flex items-start space-x-2">
        <RadioGroupItem value="pro" id="pro" className="mt-1" />
        <div className="space-y-1">
          <Label htmlFor="pro">Pro</Label>
          <p className="text-sm text-muted-foreground">
            Pro plan with all features
          </p>
        </div>
      </div>
      <div className="flex items-start space-x-2">
        <RadioGroupItem value="enterprise" id="enterprise" className="mt-1" />
        <div className="space-y-1">
          <Label htmlFor="enterprise">Enterprise</Label>
          <p className="text-sm text-muted-foreground">
            Enterprise plan with custom features
          </p>
        </div>
      </div>
    </RadioGroup>
  ),
};

