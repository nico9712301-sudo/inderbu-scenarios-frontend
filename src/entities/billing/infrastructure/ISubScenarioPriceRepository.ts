import { 
  SubScenarioPriceEntity, 
  CreateSubScenarioPriceData, 
  UpdateSubScenarioPriceData 
} from '../domain/SubScenarioPriceEntity';

export interface ISubScenarioPriceRepository {
  create(data: CreateSubScenarioPriceData): Promise<SubScenarioPriceEntity>;
  getBySubScenarioId(subScenarioId: number): Promise<SubScenarioPriceEntity | null>;
  updateBySubScenarioId(subScenarioId: number, data: UpdateSubScenarioPriceData): Promise<SubScenarioPriceEntity>;
  deleteBySubScenarioId(subScenarioId: number): Promise<void>;
}
