import type { Meta, StoryObj } from '@storybook/react';
import { FacilityCard } from './facility-card';
import { ISubScenario } from '@/presentation/features/home/types/filters.types';

// Mock data for different types of facilities
const mockSubScenarios: ISubScenario[] = [
  {
    id: 1,
    name: 'Cancha Principal de Fútbol',
    hasCost: false,
    numberOfSpectators: 5000,
    numberOfPlayers: 22,
    recommendations: 'Usar zapatos deportivos con tapones. Llegar 30 minutos antes del partido.',
    scenario: {
      id: 1,
      name: 'Estadio El Campín',
      address: 'Carrera 30 # 45-67',
      neighborhood: { id: 1, name: 'Teusaquillo' },
    },
    activityArea: { id: 1, name: 'Fútbol' },
    fieldSurfaceType: { id: 1, name: 'Césped Natural' },
    imageGallery: {
      additional: [],
      count: 1,
      featured: {
        createdAt: '2024-01-01',
        displayOrder: 1,
        id: 1,
        isFeature: true,
        path: 'uploads/stadium.jpg',
        subScenarioId: 1,
        url: 'https://inderbu.gov.co/escenarios/content/fields/57/12770.jpg',
      },
    },
  },
  {
    id: 2,
    name: 'Cancha de Baloncesto Cubierta',
    hasCost: true,
    numberOfSpectators: 500,
    numberOfPlayers: 10,
    recommendations: 'Traer uniforme deportivo. Prohibido el uso de zapatos de calle.',
    scenario: {
      id: 2,
      name: 'Coliseo Cubierto Central',
      address: 'Avenida 68 # 12-34',
      neighborhood: { id: 2, name: 'Chapinero' },
    },
    activityArea: { id: 2, name: 'Baloncesto' },
    fieldSurfaceType: { id: 2, name: 'Sintético' },
    imageGallery: {
      additional: [],
      count: 1,
    },
  },
  {
    id: 3,
    name: 'Pista de Atletismo',
    hasCost: false,
    numberOfSpectators: 2000,
    numberOfPlayers: 8,
    recommendations: 'Usar spikes apropiados para atletismo. Entrada libre para entrenamientos.',
    scenario: {
      id: 3,
      name: 'Complejo Deportivo Norte',
      address: 'Calle 80 # 15-45',
      neighborhood: { id: 3, name: 'Suba' },
    },
    activityArea: { id: 3, name: 'Atletismo' },
    fieldSurfaceType: { id: 3, name: 'Tartán' },
  },
  {
    id: 4,
    name: 'Piscina Olímpica',
    hasCost: true,
    numberOfSpectators: 800,
    numberOfPlayers: 1,
    recommendations: 'Traer traje de baño y gorro. Certificado médico obligatorio.',
    scenario: {
      id: 4,
      name: 'Centro Acuático',
      address: 'Carrera 15 # 93-45',
      neighborhood: { id: 4, name: 'Usaquén' },
    },
    activityArea: { id: 4, name: 'Natación' },
    fieldSurfaceType: { id: 4, name: 'Agua Clorada' },
  },
  {
    id: 5,
    name: 'Cancha de Tenis Clay',
    hasCost: true,
    numberOfSpectators: 200,
    numberOfPlayers: 2,
    recommendations: 'Usar zapatos específicos para arcilla. Reservas con 24h de anticipación.',
    scenario: {
      id: 5,
      name: 'Club de Tenis Municipal',
      address: 'Calle 100 # 20-30',
      neighborhood: { id: 5, name: 'Zona Rosa' },
    },
    activityArea: { id: 5, name: 'Tenis' },
    fieldSurfaceType: { id: 5, name: 'Arcilla' },
  },
];

const meta: Meta<typeof FacilityCard> = {
  title: 'DESIGN SYSTEM/Organisms/FacilityCard',
  component: FacilityCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Card component to display sports facility information with image, details, and navigation link.',
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
  argTypes: {
    subScenario: {
      description: 'Sub-scenario object containing facility information',
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
type Story = StoryObj<typeof FacilityCard>;

// Default facility card
export const Default: Story = {
  args: {
    subScenario: mockSubScenarios[0],
  },
};

// Free facility
export const FreeFacility: Story = {
  args: {
    subScenario: mockSubScenarios[0],
  },
  parameters: {
    docs: {
      description: {
        story: 'Facility card for a free (no cost) sports facility.',
      },
    },
  },
};

// Paid facility
export const PaidFacility: Story = {
  args: {
    subScenario: mockSubScenarios[1],
  },
  parameters: {
    docs: {
      description: {
        story: 'Facility card for a paid sports facility.',
      },
    },
  },
};

// Indoor facility
export const IndoorFacility: Story = {
  args: {
    subScenario: mockSubScenarios[1],
  },
  parameters: {
    docs: {
      description: {
        story: 'Indoor sports facility with specific requirements.',
      },
    },
  },
};

// Athletics track
export const AthleticsTrack: Story = {
  args: {
    subScenario: mockSubScenarios[2],
  },
  parameters: {
    docs: {
      description: {
        story: 'Athletics track facility with professional requirements.',
      },
    },
  },
};

// Swimming pool
export const SwimmingPool: Story = {
  args: {
    subScenario: mockSubScenarios[3],
  },
  parameters: {
    docs: {
      description: {
        story: 'Olympic swimming pool with health requirements.',
      },
    },
  },
};

// Tennis court
export const TennisCourt: Story = {
  args: {
    subScenario: mockSubScenarios[4],
  },
  parameters: {
    docs: {
      description: {
        story: 'Tennis court with clay surface and reservation requirements.',
      },
    },
  },
};

// Grid layout example
export const GridLayout: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
      {mockSubScenarios.slice(0, 3).map((subScenario) => (
        <FacilityCard key={subScenario.id} subScenario={subScenario} />
      ))}
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Multiple facility cards in a responsive grid layout.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
};

// Different sports comparison
export const SportComparison: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">Deportes de Equipo</h3>
        <div className="space-y-4">
          <FacilityCard subScenario={mockSubScenarios[0]} />
          <FacilityCard subScenario={mockSubScenarios[1]} />
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Deportes Individuales</h3>
        <div className="space-y-4">
          <FacilityCard subScenario={mockSubScenarios[3]} />
          <FacilityCard subScenario={mockSubScenarios[4]} />
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Comparison of team sports vs individual sports facilities.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
};

// Capacity comparison
export const CapacityComparison: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
      {[...mockSubScenarios]
        .sort((a, b) => b.numberOfSpectators - a.numberOfSpectators)
        .map((subScenario) => (
          <div key={subScenario.id} className="relative">
            <FacilityCard subScenario={subScenario} />
            <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
              {subScenario.numberOfSpectators.toLocaleString()} espectadores
            </div>
          </div>
        ))}
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Facility cards sorted by spectator capacity with capacity badges.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
};

// Cost indicator
export const CostIndicator: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          Instalaciones Gratuitas
        </h3>
        <div className="space-y-4">
          {mockSubScenarios
            .filter((s) => !s.hasCost)
            .map((subScenario) => (
              <FacilityCard key={subScenario.id} subScenario={subScenario} />
            ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
          Instalaciones de Pago
        </h3>
        <div className="space-y-4">
          {mockSubScenarios
            .filter((s) => s.hasCost)
            .map((subScenario) => (
              <FacilityCard key={subScenario.id} subScenario={subScenario} />
            ))}
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Facility cards grouped by cost (free vs paid).',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="p-6">
        <Story />
      </div>
    ),
  ],
};