export interface SubScenarioPriceEntity {
  id: number;
  subScenarioId: number;
  hourlyPrice: number;
  createdAt: Date;
  updatedAt: Date;
  formattedPrice: string;
}

export interface CreateSubScenarioPriceData {
  subScenarioId: number;
  hourlyPrice: number;
}

export interface UpdateSubScenarioPriceData {
  hourlyPrice: number;
}

export interface CalculateCostData {
  subScenarioId: number;
  startDateTime: Date;
  endDateTime: Date;
}

export interface ReservationCostResult {
  totalCost: number;
  totalHours: number;
  hourlyPrice: number;
  formattedCost: string;
  hasPrice: boolean;
}

export interface SubScenarioPriceValidation {
  isValid: boolean;
  reason?: string;
}

export class SubScenarioPriceTransformer {
  static fromApiData(apiData: any): SubScenarioPriceEntity {
    return {
      id: apiData.id,
      subScenarioId: apiData.subScenarioId,
      hourlyPrice: apiData.hourlyPrice,
      createdAt: new Date(apiData.createdAt),
      updatedAt: new Date(apiData.updatedAt),
      formattedPrice: apiData.formattedPrice,
    };
  }

  static toCreateRequest(data: CreateSubScenarioPriceData) {
    return {
      subScenarioId: data.subScenarioId,
      hourlyPrice: data.hourlyPrice,
    };
  }

  static toUpdateRequest(data: UpdateSubScenarioPriceData) {
    return {
      hourlyPrice: data.hourlyPrice,
    };
  }

  static toCalculateCostRequest(data: CalculateCostData) {
    return {
      subScenarioId: data.subScenarioId,
      startDateTime: data.startDateTime.toISOString(),
      endDateTime: data.endDateTime.toISOString(),
    };
  }
}