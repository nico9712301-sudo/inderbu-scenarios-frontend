import type { Meta, StoryObj } from '@storybook/react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion';

const meta: Meta<typeof Accordion> = {
  title: 'UI/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

// Basic accordion
export const Basic: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other components'
          aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It's animated by default, but you can disable it if you prefer.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// Multiple items open
export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>
          Content for section 1. Multiple sections can be open at the same
          time.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>
          Content for section 2. You can expand multiple sections
          simultaneously.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Section 3</AccordionTrigger>
        <AccordionContent>
          Content for section 3. All sections can be expanded at once.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// With default open
export const DefaultOpen: Story = {
  render: () => (
    <Accordion type="single" defaultValue="item-1" collapsible className="w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>This is open by default</AccordionTrigger>
        <AccordionContent>
          This accordion item is open by default when the component loads.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>This is closed</AccordionTrigger>
        <AccordionContent>
          This accordion item starts closed.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

// Long content
export const LongContent: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[500px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Frequently Asked Questions</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <p>
              This is a longer content section that demonstrates how the
              accordion handles substantial amounts of text. The content will
              expand and collapse smoothly.
            </p>
            <p>
              You can include multiple paragraphs, lists, or any other content
              within the accordion content area.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>First item in a list</li>
              <li>Second item in a list</li>
              <li>Third item in a list</li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

