import { 
  GetDashboardReservationsUseCase, 
  DashboardReservationsResponse 
} from '../application/GetDashboardReservationsUseCase';

export class DashboardReservationsService {
  constructor(
    private readonly getDashboardReservationsUseCase: GetDashboardReservationsUseCase
  ) {}

  async getDashboardReservations(filters: Record<string, any> = {}): Promise<DashboardReservationsResponse> {
    return await this.getDashboardReservationsUseCase.execute(filters);
  }
}
