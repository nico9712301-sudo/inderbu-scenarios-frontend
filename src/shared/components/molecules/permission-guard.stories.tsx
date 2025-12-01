import type { Meta, StoryObj } from '@storybook/react';
import { PermissionGuard } from './permission-guard';
import { EUserRole } from '@/shared/enums/user-role.enum';
import { Shield, Lock, User, Settings, Eye, EyeOff } from 'lucide-react';

// Mock hooks for Storybook
const mockUseRoleChecks = (currentRole: EUserRole) => ({
  isRole: (role: EUserRole) => currentRole === role,
  hasAnyRole: (roles: EUserRole[]) => roles.includes(currentRole),
  isSuperAdmin: () => currentRole === EUserRole.SUPER_ADMIN,
  isAdmin: () => currentRole === EUserRole.ADMIN,
  isIndependent: () => currentRole === EUserRole.INDEPENDIENTE,
  isSportsClub: () => currentRole === EUserRole.CLUB_DEPORTIVO,
  isCoach: () => currentRole === EUserRole.ENTRENADOR,
});

const mockUsePermissions = (currentRole: EUserRole) => ({
  canCreateScenario: [EUserRole.SUPER_ADMIN, EUserRole.ADMIN].includes(currentRole),
  canEditScenario: [EUserRole.SUPER_ADMIN, EUserRole.ADMIN].includes(currentRole),
  canDeleteScenario: currentRole === EUserRole.SUPER_ADMIN,
  canViewUsers: [EUserRole.SUPER_ADMIN, EUserRole.ADMIN].includes(currentRole),
  canEditUsers: currentRole === EUserRole.SUPER_ADMIN,
  canMakeReservation: true, // All users can make reservations
  canViewReports: [EUserRole.SUPER_ADMIN, EUserRole.ADMIN].includes(currentRole),
});

// Mock the hooks using React context for this story
const PermissionProvider = ({ children, role }: { children: React.ReactNode; role: EUserRole }) => {
  // In a real implementation, these would come from context
  const roleChecks = mockUseRoleChecks(role);
  const permissions = mockUsePermissions(role);

  // Mock the hooks by replacing them in the component scope
  React.useEffect(() => {
    // This is a hack for Storybook - in real app these would come from React context
    (window as any).__mockRoleChecks = roleChecks;
    (window as any).__mockPermissions = permissions;
  }, [roleChecks, permissions]);

  return <>{children}</>;
};

// Component examples for testing
const AdminOnlyContent = () => (
  <div className="p-4 bg-red-50 border border-red-200 rounded">
    <Shield className="w-5 h-5 inline mr-2 text-red-600" />
    <span className="text-red-800 font-medium">Admin Only Content</span>
    <p className="text-sm text-red-600 mt-1">This content is only visible to administrators.</p>
  </div>
);

const SuperAdminOnlyContent = () => (
  <div className="p-4 bg-purple-50 border border-purple-200 rounded">
    <Lock className="w-5 h-5 inline mr-2 text-purple-600" />
    <span className="text-purple-800 font-medium">Super Admin Only</span>
    <p className="text-sm text-purple-600 mt-1">Maximum security clearance required.</p>
  </div>
);

const UserContent = () => (
  <div className="p-4 bg-green-50 border border-green-200 rounded">
    <User className="w-5 h-5 inline mr-2 text-green-600" />
    <span className="text-green-800 font-medium">User Content</span>
    <p className="text-sm text-green-600 mt-1">Available to all authenticated users.</p>
  </div>
);

const SettingsContent = () => (
  <div className="p-4 bg-blue-50 border border-blue-200 rounded">
    <Settings className="w-5 h-5 inline mr-2 text-blue-600" />
    <span className="text-blue-800 font-medium">Settings Panel</span>
    <p className="text-sm text-blue-600 mt-1">Configuration and administration tools.</p>
  </div>
);

const AccessDeniedFallback = () => (
  <div className="p-4 bg-gray-50 border border-gray-200 rounded">
    <EyeOff className="w-5 h-5 inline mr-2 text-gray-600" />
    <span className="text-gray-800 font-medium">Access Denied</span>
    <p className="text-sm text-gray-600 mt-1">You don't have permission to view this content.</p>
  </div>
);

const meta: Meta<typeof PermissionGuard> = {
  title: 'DESIGN SYSTEM/Molecules/PermissionGuard',
  component: PermissionGuard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A component to conditionally render content based on user roles and permissions.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    requiredRole: {
      control: 'select',
      options: Object.values(EUserRole).filter(value => typeof value === 'number'),
      description: 'Required user role to view content',
    },
    allowedRoles: {
      control: 'object',
      description: 'Array of allowed roles',
    },
    mode: {
      control: 'select',
      options: ['hide', 'show-fallback'],
      description: 'How to handle unauthorized access',
    },
  },
  decorators: [
    (Story, { parameters }) => {
      const role = parameters.mockRole || EUserRole.INDEPENDIENTE;
      return (
        <PermissionProvider role={role}>
          <div className="w-96 space-y-4">
            <div className="text-center p-2 bg-gray-100 rounded">
              <span className="text-sm font-medium">
                Current Role: {role === EUserRole.SUPER_ADMIN ? 'Super Admin' :
                             role === EUserRole.ADMIN ? 'Admin' :
                             role === EUserRole.INDEPENDIENTE ? 'Independent User' :
                             role === EUserRole.CLUB_DEPORTIVO ? 'Sports Club' :
                             role === EUserRole.ENTRENADOR ? 'Coach' : 'Unknown'}
              </span>
            </div>
            <Story />
          </div>
        </PermissionProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof PermissionGuard>;

// Role-based access stories
export const SuperAdminRole: Story = {
  render: () => (
    <PermissionGuard requiredRole={EUserRole.SUPER_ADMIN}>
      <SuperAdminOnlyContent />
    </PermissionGuard>
  ),
  parameters: {
    mockRole: EUserRole.SUPER_ADMIN,
    docs: {
      description: {
        story: 'Content only visible to Super Admin users.',
      },
    },
  },
};

export const AdminRole: Story = {
  render: () => (
    <PermissionGuard requiredRole={EUserRole.ADMIN}>
      <AdminOnlyContent />
    </PermissionGuard>
  ),
  parameters: {
    mockRole: EUserRole.ADMIN,
    docs: {
      description: {
        story: 'Content only visible to Admin users.',
      },
    },
  },
};

export const AccessDenied: Story = {
  render: () => (
    <PermissionGuard requiredRole={EUserRole.ADMIN}>
      <AdminOnlyContent />
    </PermissionGuard>
  ),
  parameters: {
    mockRole: EUserRole.INDEPENDIENTE,
    docs: {
      description: {
        story: 'Shows how content is hidden when user lacks required role.',
      },
    },
  },
};

// Multiple allowed roles
export const AllowedRoles: Story = {
  render: () => (
    <PermissionGuard allowedRoles={[EUserRole.SUPER_ADMIN, EUserRole.ADMIN, EUserRole.ENTRENADOR]}>
      <SettingsContent />
    </PermissionGuard>
  ),
  parameters: {
    mockRole: EUserRole.ENTRENADOR,
    docs: {
      description: {
        story: 'Content visible to multiple specified roles (Super Admin, Admin, and Coach).',
      },
    },
  },
};

// With fallback content
export const WithFallback: Story = {
  render: () => (
    <PermissionGuard
      requiredRole={EUserRole.SUPER_ADMIN}
      mode="show-fallback"
      fallback={<AccessDeniedFallback />}
    >
      <SuperAdminOnlyContent />
    </PermissionGuard>
  ),
  parameters: {
    mockRole: EUserRole.INDEPENDIENTE,
    docs: {
      description: {
        story: 'Shows fallback content when access is denied instead of hiding completely.',
      },
    },
  },
};

// Permission-based access (mock implementation)
export const PermissionBased: Story = {
  render: () => {
    // Create a mock permission guard that simulates permission checking
    const MockPermissionGuard = ({ children, canEdit }: { children: React.ReactNode; canEdit: boolean }) => {
      if (canEdit) {
        return <>{children}</>;
      }
      return null;
    };

    return (
      <div className="space-y-4">
        <MockPermissionGuard canEdit={true}>
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <Eye className="w-5 h-5 inline mr-2 text-green-600" />
            <span className="text-green-800 font-medium">Edit Scenario</span>
            <p className="text-sm text-green-600 mt-1">User has edit permissions.</p>
          </div>
        </MockPermissionGuard>

        <MockPermissionGuard canEdit={false}>
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <Lock className="w-5 h-5 inline mr-2 text-red-600" />
            <span className="text-red-800 font-medium">Delete Scenario</span>
            <p className="text-sm text-red-600 mt-1">User lacks delete permissions.</p>
          </div>
        </MockPermissionGuard>
      </div>
    );
  },
  parameters: {
    mockRole: EUserRole.ADMIN,
    docs: {
      description: {
        story: 'Demonstrates permission-based access control (mocked for demo).',
      },
    },
  },
};

// Nested guards example
export const NestedGuards: Story = {
  render: () => (
    <div className="space-y-4">
      <PermissionGuard allowedRoles={[EUserRole.SUPER_ADMIN, EUserRole.ADMIN]}>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <Shield className="w-5 h-5 inline mr-2 text-blue-600" />
          <span className="text-blue-800 font-medium">Admin Panel</span>

          <div className="mt-3 space-y-2">
            <PermissionGuard requiredRole={EUserRole.SUPER_ADMIN}>
              <div className="p-2 bg-purple-100 rounded text-sm">
                <Lock className="w-4 h-4 inline mr-1 text-purple-600" />
                Super Admin Settings
              </div>
            </PermissionGuard>

            <div className="p-2 bg-blue-100 rounded text-sm">
              <Settings className="w-4 h-4 inline mr-1 text-blue-600" />
              General Admin Tools
            </div>
          </div>
        </div>
      </PermissionGuard>
    </div>
  ),
  parameters: {
    mockRole: EUserRole.SUPER_ADMIN,
    docs: {
      description: {
        story: 'Shows nested permission guards for hierarchical access control.',
      },
    },
  },
};

// Different roles comparison
export const RoleComparison: Story = {
  render: () => {
    const roles = [
      { role: EUserRole.SUPER_ADMIN, name: 'Super Admin', color: 'purple' },
      { role: EUserRole.ADMIN, name: 'Admin', color: 'blue' },
      { role: EUserRole.ENTRENADOR, name: 'Coach', color: 'orange' },
      { role: EUserRole.INDEPENDIENTE, name: 'User', color: 'green' },
    ];

    return (
      <div className="space-y-4">
        {roles.map(({ role, name, color }) => (
          <div key={role} className={`p-3 bg-${color}-50 border border-${color}-200 rounded`}>
            <h3 className={`font-medium text-${color}-800 mb-2`}>{name} View:</h3>
            <div className="space-y-2">
              <PermissionGuard requiredRole={EUserRole.SUPER_ADMIN} mode="show-fallback" fallback={<span className="text-gray-400 text-sm">❌ Super Admin Content</span>}>
                <span className="text-green-600 text-sm">✅ Super Admin Content</span>
              </PermissionGuard>

              <PermissionGuard allowedRoles={[EUserRole.SUPER_ADMIN, EUserRole.ADMIN]} mode="show-fallback" fallback={<span className="text-gray-400 text-sm">❌ Admin Content</span>}>
                <span className="text-green-600 text-sm">✅ Admin Content</span>
              </PermissionGuard>

              <PermissionGuard allowedRoles={[EUserRole.SUPER_ADMIN, EUserRole.ADMIN, EUserRole.ENTRENADOR]} mode="show-fallback" fallback={<span className="text-gray-400 text-sm">❌ Staff Content</span>}>
                <span className="text-green-600 text-sm">✅ Staff Content</span>
              </PermissionGuard>

              <span className="text-green-600 text-sm">✅ Public Content</span>
            </div>
          </div>
        ))}
      </div>
    );
  },
  parameters: {
    mockRole: EUserRole.ADMIN,
    docs: {
      description: {
        story: 'Comparison of what different roles can see.',
      },
    },
  },
};