import { ClientHttpClientFactory } from "./http-client-client";

export interface Module {
  id: number;
  name: string;
}

export interface EntityType {
  id: number;
  name: string;
  type: string;
}

class ModulesService {
  private readonly httpClient = ClientHttpClientFactory.createClientWithAuth();

  async getModules(): Promise<Module[]> {
    const response = await this.httpClient.get<{
      data: Module[];
      message: string;
      statusCode: string;
    }>("/modules");
    console.log("Modules fetched:", response);
    return response.data;
  }

  async getEntities(): Promise<EntityType[]> {
    const response = await this.httpClient.get<{
      data: EntityType[];
      message: string;
      statusCode: string;
    }>("/entities");
    return response.data;
  }
}

export const modulesService = new ModulesService();