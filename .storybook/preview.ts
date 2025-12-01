import type { Preview } from '@storybook/react';
import '../src/app/globals.css';
import { Providers } from '../src/shared/providers/Providers';
import React from 'react';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#09090b',
        },
      ],
    },
  },
  decorators: [
    (Story) => (
      <Providers>
        <div className="p-4">
          <Story />
        </div>
      </Providers>
    ),
  ],
};

export default preview;

