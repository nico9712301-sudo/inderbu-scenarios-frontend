import { RoleEntity, RolePlainObject  } from "@/entities/role/domain/RoleEntity";

export interface CityPlainObject {
  id: number;
  name: string;
}

export interface CommunePlainObject {
  id: number;
  name: string;
  city: CityPlainObject;
}

export interface NeighborhoodPlainObject {
  id: number;
  name: string;
  commune: CommunePlainObject;
}

export interface UserPlainObject {
  id: number;
  dni: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  active: boolean;

  // Relaciones completas
  role: RolePlainObject;
  neighborhood: NeighborhoodPlainObject | null;
  commune: CommunePlainObject | null;
  city: CityPlainObject | null;

  // Claves foráneas (útiles para requests)
  roleId: number;
  neighborhoodId: number;

  createdAt?: string;
  updatedAt?: string;

  // atributos privados
  password?: string;
}

/**
 * User Domain Error for repository operations
 */
export class UserDomainError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "UserDomainError";
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
    public readonly address: string,
    public readonly isActive: boolean,

    // Relaciones completas
    public readonly role: RoleEntity,
    public readonly neighborhood: NeighborhoodPlainObject,
    public readonly commune: CommunePlainObject,
    public readonly city: CityPlainObject,

    // Claves foráneas
    public readonly roleId: number,
    public readonly neighborhoodId: number,

    public readonly createdAt?: string,
    public readonly updatedAt?: string
  ) {}

  static fromApiData(data: any): UserEntity {
    if (!data || typeof data.id !== "number" || data.id <= 0) {
      throw new UserDomainError(
        "Invalid user data: ID is required and must be positive"
      );
    }

    const firstName = data.firstName || data.first_name || "";
    const lastName = data.lastName || data.last_name || "";

    return new UserEntity(
      data.id,
      data.dni || 0,
      firstName,
      lastName,
      data.email || "",
      data.phone || "",
      data.address || "",
      data.active ?? true,
      RoleEntity.fromApiData(data.role),
      data.neighborhood || {
        id: data.neighborhoodId || 0,
        name: "",
        commune: null,
      },
      data.commune || null,
      data.city || null,

      data.roleId || (data.role?.id ?? 3),
      data.neighborhoodId || (data.neighborhood?.id ?? 0),

      data.createdAt,
      data.updatedAt
    );
  }

  toPlainObject(): UserPlainObject {
    // Aseguramos que role sea un plain object
    const rolePlain: RolePlainObject = this.role
      ? this.role.toPlainObject()
      : {
          id: this.roleId || 3,
          name: 'independiente',
          description: 'Usuario independiente por defecto',
          isActive: true,
          createdAt: undefined,
          updatedAt: undefined,
        };

    // Clonar superficialmente las relaciones geográficas para evitar prototipos raros
    const neighborhoodPlain = this.neighborhood ? { ...this.neighborhood } : null;
    const communePlain = this.commune ? { ...this.commune } : null;
    const cityPlain = this.city ? { ...this.city } : null;

    return {
      id: this.id,
      dni: this.dni,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      address: this.address,
      active: this.isActive,

      role: rolePlain,
      neighborhood: neighborhoodPlain,
      commune: communePlain,
      city: cityPlain,

      roleId: this.roleId,
      neighborhoodId: this.neighborhoodId,

      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  toApiFormat(): any {
    return {
      id: this.id,
      dni: this.dni,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      address: this.address,
      active: this.isActive,
      roleId: this.roleId,
      neighborhoodId: this.neighborhoodId,
    };
  }
}
