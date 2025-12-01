import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {
      // Completely disable Next.js config to avoid webpack conflicts
      nextConfigPath: undefined,
    },
  },
  webpackFinal: async (config) => {
    // Completely override webpack experiments to fix Next.js 15 + Storybook compatibility
    // Only include minimal safe webpack experiments
    config.experiments = {
      asyncWebAssembly: false,
      syncWebAssembly: false,
      topLevelAwait: true,
    };

    // Remove any Next.js specific optimizations that might conflict with Storybook
    if (config.optimization) {
      delete config.optimization.runtimeChunk;
      delete config.optimization.splitChunks;
    }

    // Configure path aliases manually
    const path = require('path');
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@': path.resolve(__dirname, '../src'),
        '@/shared': path.resolve(__dirname, '../src/shared'),
        '@/presentation': path.resolve(__dirname, '../src/presentation'),
        '@/entities': path.resolve(__dirname, '../src/entities'),
        '@/application': path.resolve(__dirname, '../src/application'),
        '@/infrastructure': path.resolve(__dirname, '../src/infrastructure'),
      },
    };

    return config;
  },
  staticDirs: ['../public'],
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  core: {
    disableTelemetry: true,
  },
};

export default config;

