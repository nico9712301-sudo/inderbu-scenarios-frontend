export interface IGetAllSubScenariosRequest {
  scenarioId?: number;
  page?: number;
  limit?: number;
  searchQuery?: string;
  activityAreaId?: number;
  neighborhoodId?: number;
  hasCost?: boolean;
}
