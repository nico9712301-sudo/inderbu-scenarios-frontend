import type { Meta, StoryObj } from '@storybook/react';
import { SearchSelect, SearchSelectOption } from './search-select';
import { Search, MapPin, User, Building } from 'lucide-react';
import { useState } from 'react';

// Mock data for demo
const mockOptions: SearchSelectOption[] = [
  { id: 1, name: 'Estadio El Campín' },
  { id: 2, name: 'Coliseo Cubierto' },
  { id: 3, name: 'Cancha de Fútbol Norte' },
  { id: 4, name: 'Gimnasio Principal' },
  { id: 5, name: 'Piscina Olímpica' },
  { id: 6, name: 'Cancha de Tenis' },
  { id: 7, name: 'Pista de Atletismo' },
  { id: 8, name: 'Campo de Hockey' },
];

const mockUsers: SearchSelectOption[] = [
  { id: 1, name: 'Juan Pérez' },
  { id: 2, name: 'María García' },
  { id: 3, name: 'Carlos Rodríguez' },
  { id: 4, name: 'Ana López' },
  { id: 5, name: 'Pedro Martínez' },
];

const mockLocations: SearchSelectOption[] = [
  { id: 1, name: 'Bogotá, Colombia' },
  { id: 2, name: 'Medellín, Colombia' },
  { id: 3, name: 'Cali, Colombia' },
  { id: 4, name: 'Barranquilla, Colombia' },
  { id: 5, name: 'Cartagena, Colombia' },
];

// Mock search functions
const mockSearch = async (query: string): Promise<SearchSelectOption[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  if (!query) return mockOptions;

  return mockOptions.filter(option =>
    option.name.toLowerCase().includes(query.toLowerCase())
  );
};

const mockSearchUsers = async (query: string): Promise<SearchSelectOption[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  if (!query) return mockUsers;

  return mockUsers.filter(option =>
    option.name.toLowerCase().includes(query.toLowerCase())
  );
};

const mockSearchLocations = async (query: string): Promise<SearchSelectOption[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));

  if (!query) return mockLocations;

  return mockLocations.filter(option =>
    option.name.toLowerCase().includes(query.toLowerCase())
  );
};

const mockSearchById = async (id: string | number): Promise<SearchSelectOption | null> => {
  await new Promise(resolve => setTimeout(resolve, 200));

  return mockOptions.find(option => option.id.toString() === id.toString()) || null;
};

const meta: Meta<typeof SearchSelect> = {
  title: 'DESIGN SYSTEM/Molecules/SearchSelect',
  component: SearchSelect,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A searchable select component with async data loading and caching capabilities.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no option is selected',
    },
    searchPlaceholder: {
      control: 'text',
      description: 'Placeholder text for the search input',
    },
    emptyMessage: {
      control: 'text',
      description: 'Message shown when no options are found',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SearchSelect>;

// Default search select
export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | null>(null);

    return (
      <SearchSelect
        placeholder="Seleccionar escenario"
        searchPlaceholder="Buscar escenario..."
        value={value}
        onValueChange={setValue}
        onSearch={mockSearch}
        onSearchById={mockSearchById}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic search select with sports facilities data.',
      },
    },
  },
};

// With icon and initial option
export const WithIcon: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | null>(1);

    return (
      <SearchSelect
        placeholder="Seleccionar ubicación"
        searchPlaceholder="Buscar ubicación..."
        icon={MapPin}
        value={value}
        onValueChange={setValue}
        onSearch={mockSearchLocations}
        initialOption={{ id: 1, name: 'Bogotá, Colombia' }}
        emptyMessage="No se encontraron ubicaciones"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Search select with an icon and pre-selected initial option.',
      },
    },
  },
};

// User selection
export const UserSelection: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | null>(null);

    return (
      <SearchSelect
        placeholder="Seleccionar usuario"
        searchPlaceholder="Buscar por nombre..."
        icon={User}
        value={value}
        onValueChange={setValue}
        onSearch={mockSearchUsers}
        emptyMessage="Usuario no encontrado"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Search select for user selection with user icon.',
      },
    },
  },
};

// Custom styling
export const CustomStyling: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | null>(null);

    return (
      <SearchSelect
        placeholder="Seleccionar instalación"
        searchPlaceholder="Buscar instalación..."
        icon={Building}
        value={value}
        onValueChange={setValue}
        onSearch={mockSearch}
        className="w-full bg-blue-50 border-blue-200 hover:bg-blue-100"
        emptyMessage="No hay instalaciones disponibles"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Search select with custom styling and colors.',
      },
    },
  },
};

// Multiple instances
export const MultipleInstances: Story = {
  render: () => {
    const [facility, setFacility] = useState<string | number | null>(null);
    const [user, setUser] = useState<string | number | null>(null);
    const [location, setLocation] = useState<string | number | null>(null);

    return (
      <div className="space-y-4 w-80">
        <div>
          <label className="block text-sm font-medium mb-2">Instalación</label>
          <SearchSelect
            placeholder="Seleccionar instalación"
            searchPlaceholder="Buscar instalación..."
            icon={Building}
            value={facility}
            onValueChange={setFacility}
            onSearch={mockSearch}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Usuario</label>
          <SearchSelect
            placeholder="Seleccionar usuario"
            searchPlaceholder="Buscar usuario..."
            icon={User}
            value={user}
            onValueChange={setUser}
            onSearch={mockSearchUsers}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Ubicación</label>
          <SearchSelect
            placeholder="Seleccionar ubicación"
            searchPlaceholder="Buscar ubicación..."
            icon={MapPin}
            value={location}
            onValueChange={setLocation}
            onSearch={mockSearchLocations}
          />
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">Selecciones:</h3>
          <ul className="text-sm space-y-1">
            <li>Instalación: {facility || 'No seleccionada'}</li>
            <li>Usuario: {user || 'No seleccionado'}</li>
            <li>Ubicación: {location || 'No seleccionada'}</li>
          </ul>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple search select instances working independently.',
      },
    },
  },
};

// Loading and error states
export const LoadingStates: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | null>(null);

    const slowSearch = async (query: string): Promise<SearchSelectOption[]> => {
      // Simulate slow API
      await new Promise(resolve => setTimeout(resolve, 2000));
      return mockSearch(query);
    };

    return (
      <SearchSelect
        placeholder="Búsqueda lenta (2s)"
        searchPlaceholder="Buscar... (será lento)"
        icon={Search}
        value={value}
        onValueChange={setValue}
        onSearch={slowSearch}
        emptyMessage="No se encontraron resultados"
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Search select with intentionally slow loading to demonstrate loading states.',
      },
    },
  },
};

// Preselected value
export const PreselectedValue: Story = {
  render: () => {
    const [value, setValue] = useState<string | number | null>(3);

    return (
      <SearchSelect
        placeholder="Seleccionar escenario"
        searchPlaceholder="Buscar escenario..."
        icon={Building}
        value={value}
        onValueChange={setValue}
        onSearch={mockSearch}
        onSearchById={mockSearchById}
        initialOption={{ id: 3, name: 'Cancha de Fútbol Norte' }}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Search select with a preselected value and initial option.',
      },
    },
  },
};