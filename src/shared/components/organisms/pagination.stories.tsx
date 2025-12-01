import type { Meta, StoryObj } from '@storybook/react';
import { Pagination } from './pagination';
import { useState } from 'react';
import { action } from '@storybook/addon-actions';

const meta: Meta<typeof Pagination> = {
  title: 'DESIGN SYSTEM/Organisms/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Pagination component with ellipsis for navigating through multiple pages of content.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    currentPage: {
      control: { type: 'number', min: 1 },
      description: 'Current active page number',
    },
    totalPages: {
      control: { type: 'number', min: 1 },
      description: 'Total number of pages',
    },
    onPageChange: {
      action: 'page-changed',
      description: 'Callback function when page changes',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Pagination>;

// Basic pagination
export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    onPageChange: action('page-changed'),
  },
};

// Interactive pagination
export const Interactive: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 10;

    const handlePageChange = (page: number) => {
      setCurrentPage(page);
      action('page-changed')(page);
    };

    return (
      <div className="space-y-4">
        <div className="text-center p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">
            Página actual: <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
          </p>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive pagination that updates the current page when clicked.',
      },
    },
  },
};

// Few pages (no ellipsis)
export const FewPages: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(2);
    const totalPages = 5;

    return (
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Pagination with few pages - no ellipsis needed.',
      },
    },
  },
};

// Many pages (with ellipsis)
export const ManyPages: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(15);
    const totalPages = 50;

    return (
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Pagination with many pages showing ellipsis on both sides.',
      },
    },
  },
};

// First page
export const FirstPage: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 20;

    return (
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Pagination on first page - previous button disabled.',
      },
    },
  },
};

// Last page
export const LastPage: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(20);
    const totalPages = 20;

    return (
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Pagination on last page - next button disabled.',
      },
    },
  },
};

// Near beginning
export const NearBeginning: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(3);
    const totalPages = 30;

    return (
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Pagination near the beginning - ellipsis only at the end.',
      },
    },
  },
};

// Near end
export const NearEnd: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(27);
    const totalPages = 30;

    return (
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Pagination near the end - ellipsis only at the beginning.',
      },
    },
  },
};

// Single page (hidden)
export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
    onPageChange: action('page-changed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Pagination with only one page - component is hidden.',
      },
    },
  },
};

// Two pages
export const TwoPages: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 2;

    return (
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Pagination with only two pages - minimal layout.',
      },
    },
  },
};

// Large dataset example
export const LargeDataset: Story = {
  render: () => {
    const [currentPage, setCurrentPage] = useState(42);
    const totalPages = 100;

    return (
      <div className="space-y-6">
        <div className="text-center p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Navegando un Dataset Grande
          </h3>
          <p className="text-blue-600">
            Página {currentPage} de {totalPages} páginas
          </p>
          <p className="text-sm text-blue-500 mt-1">
            Simulando 5,000 elementos con 50 elementos por página
          </p>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Pagination for very large datasets with many pages.',
      },
    },
  },
};

// Different states showcase
export const AllStates: Story = {
  render: () => {
    const scenarios = [
      { name: 'Pocas páginas', currentPage: 2, totalPages: 5 },
      { name: 'Muchas páginas (medio)', currentPage: 25, totalPages: 50 },
      { name: 'Primera página', currentPage: 1, totalPages: 20 },
      { name: 'Última página', currentPage: 15, totalPages: 15 },
    ];

    return (
      <div className="space-y-8">
        {scenarios.map((scenario, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h4 className="font-semibold mb-4 text-center">{scenario.name}</h4>
            <Pagination
              currentPage={scenario.currentPage}
              totalPages={scenario.totalPages}
              onPageChange={action(`${scenario.name}-page-changed`)}
            />
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Showcase of different pagination states and scenarios.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-6 max-w-4xl mx-auto">
        <Story />
      </div>
    ),
  ],
};