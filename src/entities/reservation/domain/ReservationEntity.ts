// Domain Entity: Reservation
// Pure business logic, no framework dependencies

export interface ReservationPlainObject {
  id: number;
  type: "SINGLE" | "RANGE";
  subScenarioId: number;
  userId: number;
  initialDate: string;
  finalDate: string | null;
  weekDays: number[] | null;
  comments: string | null;
  reservationStateId: number;
  totalInstances: number;
  createdAt: string;
  updatedAt: string;
  subScenario: {
    id: number;
    name: string;
    hasCost?: boolean;
    numberOfSpectators?: number | null;
    numberOfPlayers?: number | null;
    recommendations?: string | null;
    scenarioId?: number;
    scenarioName?: string;
    scenario?: {
      id: number;
      name: string;
      address: string;
      neighborhood: {
        id: number;
        name: string;
        commune: {
          id: number;
          name: string;
          city: {
            id: number;
            name: string;
          };
        };
      };
    };
  };
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
  };
  reservationState: {
    id: number;
    state: "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | "CANCELADA";
  };
  timeslots: {
    id: number;
    startTime: string;
    endTime: string;
  }[];
}

export class ReservationEntity {
  constructor(
    public readonly id: number,
    public readonly type: "SINGLE" | "RANGE",
    public readonly subScenarioId: number,
    public readonly userId: number,
    public readonly initialDate: string,
    public readonly finalDate: string | null,
    public readonly weekDays: number[] | null,
    public readonly comments: string | null,
    public readonly reservationStateId: number,
    public readonly totalInstances: number,
    public readonly createdAt: string,
    public readonly updatedAt: string,
    public readonly subScenario: {
      id: number;
      name: string;
      hasCost?: boolean;
      numberOfSpectators?: number | null;
      numberOfPlayers?: number | null;
      recommendations?: string | null;
      scenarioId?: number;
      scenarioName?: string;
      scenario?: {
        id: number;
        name: string;
        address: string;
        neighborhood: {
          id: number;
          name: string;
          commune: {
            id: number;
            name: string;
            city: {
              id: number;
              name: string;
            };
          };
        };
      };
    },
    public readonly user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      phone?: string | null;
    },
    public readonly reservationState: {
      id: number;
      state: "PENDIENTE" | "CONFIRMADA" | "RECHAZADA" | "CANCELADA";
    },
    public readonly timeslots: {
      id: number;
      startTime: string;
      endTime: string;
    }[]
  ) {}

  // Factory method for creating from API data
  static fromApiData(data: any): ReservationEntity {
    if (!data) {
      throw new ReservationDomainError('Invalid reservation data: data is null or undefined');
    }

    if (!data.id || typeof data.id !== 'number') {
      throw new ReservationDomainError('Invalid reservation data: missing or invalid id');
    }

    return new ReservationEntity(
      data.id,
      data.type || "SINGLE",
      data.subScenarioId || data.subScenario?.id,
      data.userId || data.user?.id,
      data.initialDate || data.reservationDate,
      data.finalDate || null,
      data.weekDays || null,
      data.comments || null,
      data.reservationStateId || data.reservationState?.id,
      data.totalInstances || 1,
      data.createdAt,
      data.updatedAt,
      {
        id: data.subScenario?.id || data.subScenarioId,
        name: data.subScenario?.name || '',
        hasCost: data.subScenario?.hasCost,
        numberOfSpectators: data.subScenario?.numberOfSpectators,
        numberOfPlayers: data.subScenario?.numberOfPlayers,
        recommendations: data.subScenario?.recommendations,
        scenarioId: data.subScenario?.scenarioId || data.subScenario?.scenario?.id,
        scenarioName: data.subScenario?.scenarioName || data.subScenario?.scenario?.name,
        scenario: data.subScenario?.scenario ? {
          id: data.subScenario.scenario.id,
          name: data.subScenario.scenario.name,
          address: data.subScenario.scenario.address,
          neighborhood: data.subScenario.scenario.neighborhood
        } : undefined
      },
      {
        id: data.user?.id || data.userId,
        firstName: data.user?.firstName || data.user?.first_name || '',
        lastName: data.user?.lastName || data.user?.last_name || '',
        email: data.user?.email || '',
        phone: data.user?.phone
      },
      {
        id: data.reservationState?.id || data.reservationStateId,
        state: data.reservationState?.state || data.reservationState?.name || 'PENDIENTE'
      },
      data.timeslots || data.timeSlot ? [data.timeSlot] : []
    );
  }

  // Business methods
  isActive(): boolean {
    const now = new Date();
    const reservationDate = new Date(this.initialDate);
    
    return (
      reservationDate >= now &&
      this.reservationState.state !== "CANCELADA" &&
      this.reservationState.state !== "RECHAZADA"
    );
  }

  isPending(): boolean {
    return this.reservationState.state === "PENDIENTE";
  }

  isConfirmed(): boolean {
    return this.reservationState.state === "CONFIRMADA";
  }

  isCancelled(): boolean {
    return this.reservationState.state === "CANCELADA";
  }

  isRejected(): boolean {
    return this.reservationState.state === "RECHAZADA";
  }

  canBeModified(): boolean {
    return this.isActive() && (this.isPending() || this.isConfirmed());
  }

  belongsToUser(userId: number): boolean {
    return this.userId === userId;
  }

  belongsToSubScenario(subScenarioId: number): boolean {
    return this.subScenarioId === subScenarioId;
  }

  matchesSearchQuery(query: string): boolean {
    if (!query.trim()) return true;
    
    const searchTerm = query.toLowerCase();
    return (
      this.subScenario.name.toLowerCase().includes(searchTerm) ||
      this.user.firstName.toLowerCase().includes(searchTerm) ||
      this.user.lastName.toLowerCase().includes(searchTerm) ||
      this.user.email.toLowerCase().includes(searchTerm) ||
      (!!this.subScenario.scenario?.name && this.subScenario.scenario.name.toLowerCase().includes(searchTerm)) ||
      (!!this.comments && this.comments.toLowerCase().includes(searchTerm))
    );
  }

  getUserFullName(): string {
    return `${this.user.firstName} ${this.user.lastName}`.trim();
  }

  getStatusColor(): string {
    switch (this.reservationState.state) {
      case "CONFIRMADA":
        return "success";
      case "PENDIENTE":
        return "warning";
      case "CANCELADA":
      case "RECHAZADA":
        return "destructive";
      default:
        return "secondary";
    }
  }

  // Serialization for client components
  toPlainObject(): ReservationPlainObject {
    return {
      id: this.id,
      type: this.type,
      subScenarioId: this.subScenarioId,
      userId: this.userId,
      initialDate: this.initialDate,
      finalDate: this.finalDate,
      weekDays: this.weekDays,
      comments: this.comments,
      reservationStateId: this.reservationStateId,
      totalInstances: this.totalInstances,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      subScenario: this.subScenario,
      user: this.user,
      reservationState: this.reservationState,
      timeslots: this.timeslots
    };
  }

  // Transform to backend format
  toApiFormat(): any {
    return {
      id: this.id,
      type: this.type,
      subScenarioId: this.subScenarioId,
      userId: this.userId,
      initialDate: this.initialDate,
      finalDate: this.finalDate,
      weekDays: this.weekDays,
      comments: this.comments,
      reservationStateId: this.reservationStateId,
      totalInstances: this.totalInstances,
      // Include nested objects for API compatibility
      subScenario: this.subScenario,
      user: this.user,
      reservationState: this.reservationState,
      timeslots: this.timeslots
    };
  }
}

// Search criteria for domain operations
export class ReservationSearchCriteria {
  constructor(
    public readonly searchQuery?: string,
    public readonly userId?: number,
    public readonly subScenarioId?: number,
    public readonly scenarioId?: number,
    public readonly activityAreaId?: number,
    public readonly neighborhoodId?: number,
    public readonly dateFrom?: string,
    public readonly dateTo?: string,
    public readonly state?: string,
    public readonly active?: boolean,
    public readonly limit?: number
  ) {}

  isValid(): boolean {
    return (
      this.limit === undefined || this.limit > 0
    );
  }
}

// Domain-specific error
export class ReservationDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReservationDomainError';
  }
}