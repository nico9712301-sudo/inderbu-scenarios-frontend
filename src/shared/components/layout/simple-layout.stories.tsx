import type { Meta, StoryObj } from '@storybook/react';
import { SimpleLayout } from './simple-layout';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { BarChart, FileText, Settings, Users, Calendar, TrendingUp } from 'lucide-react';

// Mock sidebar provider for Storybook
const MockSidebarProvider = ({
  children,
  collapsed = false
}: {
  children: React.ReactNode;
  collapsed?: boolean;
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(collapsed);

  const mockSidebarContext = {
    collapsed: isCollapsed,
    setCollapsed: setIsCollapsed,
    toggle: () => setIsCollapsed(!isCollapsed),
  };

  React.useEffect(() => {
    (window as any).__mockSidebarContext = mockSidebarContext;
  }, [mockSidebarContext]);

  return <>{children}</>;
};

// Sample content components for the layout
const DashboardContent = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
      <p className="text-gray-600 mt-2">
        Gestión de escenarios deportivos y reservas
      </p>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Escenarios</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">245</div>
          <p className="text-xs text-muted-foreground">
            +12% desde el mes pasado
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reservas Activas</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">1,234</div>
          <p className="text-xs text-muted-foreground">
            +5% desde la semana pasada
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">8,945</div>
          <p className="text-xs text-muted-foreground">
            +18% desde el mes pasado
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Ocupación</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">78%</div>
          <p className="text-xs text-muted-foreground">
            +3% desde la semana pasada
          </p>
        </CardContent>
      </Card>
    </div>

    {/* Action Cards */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Acciones Rápidas
          </CardTitle>
          <CardDescription>
            Gestiona escenarios y reservas de manera eficiente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start" variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Crear Nuevo Escenario
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Gestionar Reservas
          </Button>
          <Button className="w-full justify-start" variant="outline">
            <Users className="mr-2 h-4 w-4" />
            Administrar Usuarios
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas acciones en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              'Nueva reserva en Estadio El Campín',
              'Usuario registrado: juan.perez@email.com',
              'Escenario actualizado: Cancha de Tenis #3',
              'Reserva cancelada: Piscina Olímpica',
            ].map((activity, index) => (
              <div key={index} className="text-sm text-gray-600 py-2 border-b last:border-b-0">
                {activity}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const SettingsContent = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
      <p className="text-gray-600 mt-2">
        Administra la configuración del sistema
      </p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
          <CardDescription>
            Ajustes básicos del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre del Sistema</label>
            <input
              className="w-full p-2 border rounded"
              defaultValue="Escenarios Deportivos Inderbu"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Zona Horaria</label>
            <select className="w-full p-2 border rounded">
              <option>America/Bogota</option>
              <option>America/Mexico_City</option>
              <option>Europe/Madrid</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>
            Configura las notificaciones del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Email de confirmación</span>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Recordatorios de reserva</span>
            <input type="checkbox" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Alertas de sistema</span>
            <input type="checkbox" />
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const meta: Meta<typeof SimpleLayout> = {
  title: 'DESIGN SYSTEM/Layout/SimpleLayout',
  component: SimpleLayout,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Admin dashboard layout with collapsible sidebar, admin bar, and main content area.',
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story, { parameters }) => {
      const collapsed = parameters.sidebarCollapsed || false;
      return (
        <MockSidebarProvider collapsed={collapsed}>
          <div style={{ height: '100vh' }}>
            <Story />
          </div>
        </MockSidebarProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof SimpleLayout>;

// Default layout with dashboard content
export const Default: Story = {
  args: {
    children: <DashboardContent />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Default admin layout with dashboard content and expanded sidebar.',
      },
    },
  },
};

// Collapsed sidebar
export const CollapsedSidebar: Story = {
  args: {
    children: <DashboardContent />,
  },
  parameters: {
    sidebarCollapsed: true,
    docs: {
      description: {
        story: 'Admin layout with collapsed sidebar showing only icons.',
      },
    },
  },
};

// Settings page content
export const SettingsPage: Story = {
  args: {
    children: <SettingsContent />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Admin layout displaying a settings page with form controls.',
      },
    },
  },
};

// Minimal content
export const MinimalContent: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Página Simple</h1>
        <p className="text-gray-600">
          Esta es una página con contenido mínimo para mostrar cómo se ve el layout
          con poco contenido.
        </p>
        <Button>Acción Principal</Button>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout with minimal content showing basic structure.',
      },
    },
  },
};

// Long content (scrollable)
export const LongContent: Story = {
  args: {
    children: (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Contenido Largo</h1>
        <p className="text-gray-600 mb-6">
          Esta página tiene mucho contenido para demostrar el comportamiento de scroll.
        </p>

        {Array.from({ length: 20 }, (_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Sección {i + 1}</CardTitle>
              <CardDescription>
                Esta es la descripción de la sección {i + 1}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>
              <Button className="mt-4" variant="outline">
                Acción para Sección {i + 1}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: 'Layout with long scrollable content demonstrating scroll behavior.',
      },
    },
  },
};

// Interactive sidebar toggle
export const InteractiveDemo: Story = {
  render: () => {
    const [collapsed, setCollapsed] = React.useState(false);

    return (
      <MockSidebarProvider collapsed={collapsed}>
        <SimpleLayout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Demo Interactivo</h1>
              <Button
                onClick={() => setCollapsed(!collapsed)}
                variant="outline"
              >
                {collapsed ? 'Expandir' : 'Contraer'} Sidebar
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Control del Sidebar</CardTitle>
                <CardDescription>
                  Usa el botón de arriba para alternar el estado del sidebar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  El sidebar está actualmente <strong>{collapsed ? 'contraído' : 'expandido'}</strong>.
                  El contenido principal se ajusta automáticamente al ancho disponible.
                </p>
              </CardContent>
            </Card>

            <DashboardContent />
          </div>
        </SimpleLayout>
      </MockSidebarProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo allowing you to toggle the sidebar state.',
      },
    },
  },
};