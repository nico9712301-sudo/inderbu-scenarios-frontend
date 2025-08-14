// Domain Entity: RoleEntity
// Rich domain entity for user roles

// Plain Object interface for client component serialization
export interface RolePlainObject {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Role Domain Entity
 * 
 * Encapsulates role business logic and behavior.
 */
export class RoleEntity {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string,
    public readonly isActive: boolean = true,
    public readonly createdAt?: string,
    public readonly updatedAt?: string
  ) {
    // Domain validation
    if (id <= 0) {
      throw new Error('Role ID must be a positive number');
    }
    
    if (!name.trim()) {
      throw new Error('Role name is required');
    }
    
    if (!description.trim()) {
      throw new Error('Role description is required');
    }
  }

  /**
   * Factory method to create RoleEntity from API data
   */
  static fromApiData(data: any): RoleEntity {
    if (!data || typeof data.id !== 'number' || data.id <= 0) {
      throw new Error('Invalid role data: ID is required and must be positive');
    }

    return new RoleEntity(
      data.id,
      data.name || '',
      data.description || data.name || '',
      data.isActive ?? true,
      data.createdAt,
      data.updatedAt
    );
  }

  /**
   * Business Logic: Check if role is active
   */
  isRoleActive(): boolean {
    return this.isActive;
  }

  /**
   * Business Logic: Check if user can view this role
   */
  canBeAssignedByAdmin(): boolean {
    // Business rule: Only active roles can be assigned
    return this.isActive;
  }

  /**
   * Business Logic: Get display name for UI
   */
  getDisplayName(): string {
    return this.description || this.name;
  }

  /**
   * Business Logic: Check if role matches search query
   */
  matchesSearchQuery(query: string): boolean {
    if (!query || query.trim() === '') return true;
    
    const searchTerm = query.toLowerCase().trim();
    const name = this.name.toLowerCase();
    const description = this.description.toLowerCase();
    
    return name.includes(searchTerm) || description.includes(searchTerm);
  }

  /**
   * Serialization: Convert to plain object for client components
   */
  toPlainObject(): RolePlainObject {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
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
      name: this.name,
      description: this.description,
      isActive: this.isActive,
    };
  }

  /**
   * Domain equality check
   */
  equals(other: RoleEntity): boolean {
    return this.id === other.id;
  }

  /**
   * String representation for debugging
   */
  toString(): string {
    return `RoleEntity(id=${this.id}, name=${this.name}, description=${this.description})`;
  }
}