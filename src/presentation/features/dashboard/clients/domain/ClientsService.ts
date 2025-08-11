import { 
  GetClientsDataUseCase, 
  ClientsDataResponse 
} from '../application/GetClientsDataUseCase';
import { UserFilters } from './repositories/IUserRepository';

export class ClientsService {
  constructor(
    private readonly getClientsDataUseCase: GetClientsDataUseCase
  ) {}

  async getClientsData(filters: UserFilters = {}): Promise<ClientsDataResponse> {
    return await this.getClientsDataUseCase.execute(filters);
  }
}
