import {
  SubScenarioDomainError,
  SubScenarioEntity,
} from "@/entities/sub-scenario/domain/SubScenarioEntity";
import { ISubScenarioRepository } from "@/entities/sub-scenario/infrastructure/ISubScenarioRepository";
import {
  SubScenarioBackend,
  SubScenarioTransformer,
} from "@/infrastructure/transformers/SubScenarioTransformer";
import { EventBus } from "@/shared/infrastructure/InMemoryEventBus";

// Application DTOs
export interface GetScenarioDetailInput {
  id: string;
}

// Application Use Case Interface
export interface GetScenarioDetailUseCase {
  execute(input: GetScenarioDetailInput): Promise<SubScenarioEntity>;
}

// Application Use Case Implementation
export class GetScenarioDetailUseCaseImpl implements GetScenarioDetailUseCase {
  constructor(
    private readonly subScenarioRepository: ISubScenarioRepository,
  ) {}

  async execute(input: GetScenarioDetailInput): Promise<SubScenarioEntity> {
    const subScenario: SubScenarioEntity | null =
      await this.subScenarioRepository.getById(+input.id);
    if (!subScenario) {
      throw new SubScenarioDomainError(
        `Scenario with ID ${input.id} not found`
      );
    }

    console.log("GetScenarioDetailUseCase - Fetched SubScenario:", subScenario);
    

    const subScenarioDTO = SubScenarioTransformer.toBackend(subScenario);
    return subScenario;
  }
}
