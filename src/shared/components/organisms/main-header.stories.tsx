import type { Meta, StoryObj } from '@storybook/react';
import { MainHeader } from './main-header';
import React from 'react';

// Mock auth hook for Storybook
const mockUseAuth = (authState: 'loading' | 'authenticated' | 'unauthenticated', user?: any) => ({
  user: user || null,
  logout: () => console.log('Logout clicked'),
  isAuthenticated: authState === 'authenticated',
  authReady: authState !== 'loading',
});

// Create a provider wrapper to mock the auth context
const AuthMockProvider = ({ children, authState, user }: {
  children: React.ReactNode;
  authState: 'loading' | 'authenticated' | 'unauthenticated';
  user?: any;
}) => {
  const mockAuth = mockUseAuth(authState, user);

  // Mock the useAuth hook
  React.useEffect(() => {
    (window as any).__mockAuth = mockAuth;
  }, [mockAuth]);

  return <>{children}</>;
};

const meta: Meta<typeof MainHeader> = {
  title: 'DESIGN SYSTEM/Organisms/MainHeader',
  component: MainHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Main application header with authentication, navigation, and responsive mobile menu.',
      },
    },
    nextjs: {
      appDirectory: true,
    },
    // Mock next/image to avoid issues in Storybook
    mockNextImage: true,
  },
  tags: ['autodocs'],
  decorators: [
    (Story, { parameters }) => {
      const authState = parameters.authState || 'unauthenticated';
      const user = parameters.user || null;

      return (
        <AuthMockProvider authState={authState} user={user}>
          <div style={{ minHeight: '300px' }}>
            <Story />
            {/* Mock content to show sticky behavior */}
            <div className="p-8 bg-gray-50">
              <h2 className="text-2xl font-bold mb-4">Contenido de la Página</h2>
              <p className="text-gray-600 mb-4">
                El header permanece fijo en la parte superior mientras haces scroll.
              </p>
              <div className="space-y-4">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="p-4 bg-white rounded shadow">
                    <h3 className="font-semibold">Sección {i + 1}</h3>
                    <p className="text-gray-600">Contenido de ejemplo para demostrar el scroll.</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AuthMockProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof MainHeader>;

// Loading state
export const Loading: Story = {
  parameters: {
    authState: 'loading',
    docs: {
      description: {
        story: 'Header in loading state while authentication is initializing.',
      },
    },
  },
};

// Not authenticated (guest)
export const NotAuthenticated: Story = {
  parameters: {
    authState: 'unauthenticated',
    docs: {
      description: {
        story: 'Header for non-authenticated users showing login button.',
      },
    },
  },
};

// Authenticated regular user
export const AuthenticatedUser: Story = {
  parameters: {
    authState: 'authenticated',
    user: {
      id: 1,
      email: 'usuario@example.com',
      role: 'INDEPENDIENTE',
    },
    docs: {
      description: {
        story: 'Header for authenticated regular user with user menu and reservations.',
      },
    },
  },
};

// Authenticated admin user
export const AuthenticatedAdmin: Story = {
  parameters: {
    authState: 'authenticated',
    user: {
      id: 2,
      email: 'admin@inderbu.gov.co',
      role: 'ADMIN',
    },
    docs: {
      description: {
        story: 'Header for authenticated admin user with additional admin panel access.',
      },
    },
  },
};

// Authenticated super admin
export const AuthenticatedSuperAdmin: Story = {
  parameters: {
    authState: 'authenticated',
    user: {
      id: 3,
      email: 'superadmin@inderbu.gov.co',
      role: 'SUPER_ADMIN',
    },
    docs: {
      description: {
        story: 'Header for super admin with full access to all features.',
      },
    },
  },
};

// Long email overflow
export const LongEmail: Story = {
  parameters: {
    authState: 'authenticated',
    user: {
      id: 4,
      email: 'usuario.con.email.muy.largo@institucion.educativa.gov.co',
      role: 'INDEPENDIENTE',
    },
    docs: {
      description: {
        story: 'Header with very long email address showing truncation behavior.',
      },
    },
  },
};

// Mobile layout showcase
export const MobileLayout: Story = {
  parameters: {
    authState: 'authenticated',
    user: {
      id: 1,
      email: 'usuario@example.com',
      role: 'INDEPENDIENTE',
    },
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story: 'Header optimized for mobile devices with hamburger menu.',
      },
    },
  },
};

// Different user states comparison
export const UserStatesComparison: Story = {
  render: () => {
    const userStates = [
      { title: 'No Autenticado', authState: 'unauthenticated' as const, user: null },
      {
        title: 'Usuario Regular',
        authState: 'authenticated' as const,
        user: { id: 1, email: 'usuario@example.com', role: 'INDEPENDIENTE' }
      },
      {
        title: 'Administrador',
        authState: 'authenticated' as const,
        user: { id: 2, email: 'admin@inderbu.gov.co', role: 'ADMIN' }
      },
    ];

    return (
      <div className="space-y-8">
        {userStates.map((state, index) => (
          <div key={index}>
            <h3 className="text-lg font-semibold mb-4 px-4">{state.title}</h3>
            <div className="border rounded-lg overflow-hidden">
              <AuthMockProvider authState={state.authState} user={state.user}>
                <MainHeader />
              </AuthMockProvider>
            </div>
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Comparison of header appearance for different user authentication states.',
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

// Interactive demo
export const InteractiveDemo: Story = {
  render: () => {
    const [authState, setAuthState] = React.useState<'loading' | 'authenticated' | 'unauthenticated'>('unauthenticated');
    const [userRole, setUserRole] = React.useState<'INDEPENDIENTE' | 'ADMIN' | 'SUPER_ADMIN'>('INDEPENDIENTE');

    const mockUser = authState === 'authenticated' ? {
      id: 1,
      email: userRole === 'SUPER_ADMIN' ? 'superadmin@inderbu.gov.co' :
             userRole === 'ADMIN' ? 'admin@inderbu.gov.co' :
             'usuario@example.com',
      role: userRole,
    } : null;

    return (
      <div>
        {/* Controls */}
        <div className="p-6 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold mb-4">Controles Interactivos</h3>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Estado de Autenticación:</label>
              <div className="flex gap-2">
                {(['unauthenticated', 'loading', 'authenticated'] as const).map((state) => (
                  <button
                    key={state}
                    onClick={() => setAuthState(state)}
                    className={`px-3 py-1 rounded text-sm ${
                      authState === state
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {state === 'unauthenticated' ? 'No Auth' :
                     state === 'loading' ? 'Cargando' :
                     'Autenticado'}
                  </button>
                ))}
              </div>
            </div>

            {authState === 'authenticated' && (
              <div>
                <label className="block text-sm font-medium mb-2">Rol de Usuario:</label>
                <div className="flex gap-2">
                  {(['INDEPENDIENTE', 'ADMIN', 'SUPER_ADMIN'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setUserRole(role)}
                      className={`px-3 py-1 rounded text-sm ${
                        userRole === role
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {role === 'INDEPENDIENTE' ? 'Usuario' :
                       role === 'ADMIN' ? 'Admin' :
                       'Super Admin'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Header demo */}
        <AuthMockProvider authState={authState} user={mockUser}>
          <MainHeader />
        </AuthMockProvider>

        {/* Mock content */}
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4">Contenido de Prueba</h2>
          <p className="text-gray-600">
            Cambia los controles arriba para ver cómo se comporta el header en diferentes estados.
          </p>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Interactive demo allowing you to test different authentication states and user roles.',
      },
    },
  },
};