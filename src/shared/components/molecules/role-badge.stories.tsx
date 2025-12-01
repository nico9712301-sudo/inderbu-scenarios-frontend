import type { Meta, StoryObj } from '@storybook/react';
import { RoleBadge } from './role-badge';
import { EUserRole } from '@/shared/enums/user-role.enum';

const meta: Meta<typeof RoleBadge> = {
  title: 'DESIGN SYSTEM/Molecules/RoleBadge',
  component: RoleBadge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Badge component to display user roles with different colors and variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    role: {
      control: 'select',
      options: Object.values(EUserRole).filter(value => typeof value === 'number'),
      mapping: {
        [EUserRole.SUPER_ADMIN]: EUserRole.SUPER_ADMIN,
        [EUserRole.ADMIN]: EUserRole.ADMIN,
        [EUserRole.INDEPENDIENTE]: EUserRole.INDEPENDIENTE,
        [EUserRole.CLUB_DEPORTIVO]: EUserRole.CLUB_DEPORTIVO,
        [EUserRole.ENTRENADOR]: EUserRole.ENTRENADOR,
      },
      description: 'The user role to display',
    },
    variant: {
      control: 'select',
      options: ['default', 'outline'],
      description: 'Visual variant of the badge',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RoleBadge>;

// Default role badge
export const Default: Story = {
  args: {
    role: EUserRole.ADMIN,
    variant: 'default',
  },
};

// All roles with default variant
export const AllRoles: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <RoleBadge role={EUserRole.SUPER_ADMIN} />
      <RoleBadge role={EUserRole.ADMIN} />
      <RoleBadge role={EUserRole.INDEPENDIENTE} />
      <RoleBadge role={EUserRole.CLUB_DEPORTIVO} />
      <RoleBadge role={EUserRole.ENTRENADOR} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available user roles with default styling.',
      },
    },
  },
};

// All roles with outline variant
export const AllRolesOutline: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <RoleBadge role={EUserRole.SUPER_ADMIN} variant="outline" />
      <RoleBadge role={EUserRole.ADMIN} variant="outline" />
      <RoleBadge role={EUserRole.INDEPENDIENTE} variant="outline" />
      <RoleBadge role={EUserRole.CLUB_DEPORTIVO} variant="outline" />
      <RoleBadge role={EUserRole.ENTRENADOR} variant="outline" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available user roles with outline styling.',
      },
    },
  },
};

// Variants comparison
export const VariantsComparison: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Default Variant</h3>
        <div className="flex flex-wrap gap-2">
          <RoleBadge role={EUserRole.SUPER_ADMIN} variant="default" />
          <RoleBadge role={EUserRole.ADMIN} variant="default" />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Outline Variant</h3>
        <div className="flex flex-wrap gap-2">
          <RoleBadge role={EUserRole.SUPER_ADMIN} variant="outline" />
          <RoleBadge role={EUserRole.ADMIN} variant="outline" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comparison between default and outline variants.',
      },
    },
  },
};

// Individual role examples
export const SuperAdmin: Story = {
  args: {
    role: EUserRole.SUPER_ADMIN,
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Super Admin role badge - highest level administrator.',
      },
    },
  },
};

export const Admin: Story = {
  args: {
    role: EUserRole.ADMIN,
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Admin role badge - system administrator.',
      },
    },
  },
};

export const IndependentUser: Story = {
  args: {
    role: EUserRole.INDEPENDIENTE,
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Independent user role badge - individual user.',
      },
    },
  },
};

export const SportsClub: Story = {
  args: {
    role: EUserRole.CLUB_DEPORTIVO,
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Sports club role badge - club organization.',
      },
    },
  },
};

export const Coach: Story = {
  args: {
    role: EUserRole.ENTRENADOR,
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Coach role badge - training professional.',
      },
    },
  },
};