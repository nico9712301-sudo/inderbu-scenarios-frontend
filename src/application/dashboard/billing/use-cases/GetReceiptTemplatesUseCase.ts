import { ITemplateRepository } from "@/entities/billing/infrastructure/ITemplateRepository";
import { TemplateEntity } from "@/entities/billing/domain/TemplateEntity";

export class GetReceiptTemplatesUseCase {
  constructor(
    private templateRepository: ITemplateRepository
  ) {}

  async execute(activeOnly: boolean = true, searchTerm?: string): Promise<TemplateEntity[]> {
    if (activeOnly) {
      return await this.templateRepository.getActiveReceiptTemplates(searchTerm);
    }
    
    return await this.templateRepository.getByType('receipt');
  }
}
