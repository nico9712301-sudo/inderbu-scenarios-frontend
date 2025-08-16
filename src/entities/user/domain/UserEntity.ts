import { EUserRole } from '@/shared/enums/user-role.enum';

// Plain Object interface for client component serialization
export interface UserPlainObject {
  id: number;
  dni: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleId: number;
  role: EUserRole;
  address: string;
  neighborhoodId: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User Domain Error for repository operations
 */
export class UserDomainError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'UserDomainError';
  }
}

/**
 * User Domain Entity
 * 
 * Encapsulates user business logic and behavior.
 * Provides rich domain methods for user operations and business rules.
 */
export class UserEntity {
  constructor(
    public readonly id: number,
    public readonly dni: number,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly roleId: number,
    public readonly role: EUserRole,
    public readonly address: string,
    public readonly neighborhoodId: number,
    public readonly isActive: boolean,
    public readonly createdAt?: string,
    public readonly updatedAt?: string
  ) {}

  /**
   * Factory method to create UserEntity from API data
   * Handles backend inconsistencies and normalizes data
   */
  static fromApiData(data: any): UserEntity {
    if (!data || typeof data.id !== 'number' || data.id <= 0) {
      throw new Error('Invalid user data: ID is required and must be positive');
    }

    // Handle backend inconsistencies (firstName/lastName vs first_name/last_name)
    const firstName = data.firstName || data.first_name || '';
    const lastName = data.lastName || data.last_name || '';
    
    // Convert roleId to EUserRole enum
    const role = UserEntity.getRoleFromId(data.roleId || 3); // Default to INDEPENDIENTE
    
    return new UserEntity(
      data.id,
      data.dni || 0,
      firstName,
      lastName,
      data.email || '',
      data.phone || '',
      data.roleId || 3,
      role,
      data.address || '',
      data.neighborhoodId || 0,
      data.isActive ?? true,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Business Logic: Get user's full name
   */
  getFullName(): string {
    const fullName = `${this.firstName} ${this.lastName}`.trim();
    return fullName || this.email;
  }

  /**
   * Business Logic: Check if user is active
   */
  isUserActive(): boolean {
    return this.isActive;
  }

  /**
   * Business Logic: Check if user is admin (Super Admin or Admin)
   */
  isAdmin(): boolean {
    return this.role === EUserRole.SUPER_ADMIN || this.role === EUserRole.ADMIN;
  }

  /**
   * Business Logic: Check if user can view reservations for a specific user
   */
  canViewUserReservations(targetUserId: number): boolean {
    // Users can view their own reservations
    if (this.id === targetUserId) return true;
    
    // Admins can view any reservations
    return this.isAdmin();
  }

  /**
   * Business Logic: Check if user can manage clients (admin functionality)
   */
  canManageClients(): boolean {
    return this.isAdmin();
  }

  /**
   * Business Logic: Get user role display name
   */
  getRoleDisplayName(): string {
    switch (this.role) {
      case EUserRole.SUPER_ADMIN:
        return 'Super Administrador';
      case EUserRole.ADMIN:
        return 'Administrador';
      case EUserRole.INDEPENDIENTE:
        return 'Independiente';
      case EUserRole.CLUB_DEPORTIVO:
        return 'Club Deportivo';
      case EUserRole.ENTRENADOR:
        return 'Entrenador';
      default:
        return 'Usuario';
    }
  }

  /**
   * Business Logic: Check if user matches search query
   */
  matchesSearchQuery(query: string): boolean {
    if (!query || query.trim() === '') return true;
    
    const searchTerm = query.toLowerCase().trim();
    const fullName = this.getFullName().toLowerCase();
    const email = this.email.toLowerCase();
    const dni = this.dni.toString();
    
    return fullName.includes(searchTerm) ||
           email.includes(searchTerm) ||
           dni.includes(searchTerm);
  }

  /**
   * Business Logic: Check if user has phone number
   */
  hasPhoneNumber(): boolean {
    return !!this.phone && this.phone.trim() !== '';
  }

  /**
   * Business Logic: Check if user has complete profile
   */
  hasCompleteProfile(): boolean {
    return !!(
      this.firstName.trim() &&
      this.lastName.trim() &&
      this.email &&
      this.phone &&
      this.address.trim() &&
      this.dni > 0
    );
  }

  /**
   * Serialization: Convert to plain object for client components
   * Required for Next.js client-server serialization
   */
  toPlainObject(): UserPlainObject {
    return {
      id: this.id,
      dni: this.dni,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      roleId: this.roleId,
      role: this.role,
      address: this.address,
      neighborhoodId: this.neighborhoodId,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Convert to API format for backend requests
   */
  toApiFormat(): any {
    return {
      id: this.id,
      dni: this.dni,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      roleId: this.roleId,
      address: this.address,
      neighborhoodId: this.neighborhoodId,
      isActive: this.isActive,
    };
  }

  /**
   * Static helper: Convert roleId to EUserRole enum
   */
  private static getRoleFromId(roleId: number): EUserRole {
    switch (roleId) {
      case 1: return EUserRole.SUPER_ADMIN;
      case 2: return EUserRole.ADMIN;
      case 3: return EUserRole.INDEPENDIENTE;
      case 4: return EUserRole.CLUB_DEPORTIVO;
      case 5: return EUserRole.ENTRENADOR;
      default: return EUserRole.INDEPENDIENTE; // Default role
    }
  }

  /**
   * Domain equality check
   */
  equals(other: UserEntity): boolean {
    return this.id === other.id;
  }

  /**
   * String representation for debugging
   */
  toString(): string {
    return `UserEntity(id=${this.id}, email=${this.email}, role=${this.role})`;
  }
}