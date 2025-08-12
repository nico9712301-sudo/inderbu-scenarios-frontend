import { INeighborhoodRepository } from '@/entities/neighborhood/domain/INeighborhoodRepository';
import { Neighborhood } from '@/services/api';
import { ClientHttpClient } from '@/shared/api/http-client-client';

export class NeighborhoodRepository implements INeighborhoodRepository {
  constructor(private readonly httpClient: ClientHttpClient) {}
  
  async getAll(): Promise<Neighborhood[]> {
    try {
      const result = await this.httpClient.get<{ data: Neighborhood[] } | Neighborhood[]>('/neighborhoods');
      return Array.isArray(result) ? result : result.data;
    } catch (error) {
      console.error('Error in NeighborhoodRepository.getAll:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Neighborhood | null> {
    try {
      const result = await this.httpClient.get<Neighborhood>(`/neighborhoods/${id}`);
      return result;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      console.error('Error in NeighborhoodRepository.getById:', error);
      throw error;
    }
  }

  async getByCommuneId(communeId: number): Promise<Neighborhood[]> {
    try {
      const result = await this.httpClient.get<{ data: Neighborhood[] } | Neighborhood[]>(`/neighborhoods?communeId=${communeId}`);
      return Array.isArray(result) ? result : result.data;
    } catch (error) {
      console.error('Error in NeighborhoodRepository.getByCommuneId:', error);
      throw error;
    }
  }

  async create(data: Omit<Neighborhood, 'id'>): Promise<Neighborhood> {
    try {
      const result = await this.httpClient.post<Neighborhood>('/neighborhoods', data);
      return result;
    } catch (error) {
      console.error('Error in NeighborhoodRepository.create:', error);
      throw error;
    }
  }

  async update(id: number, data: Partial<Neighborhood>): Promise<Neighborhood> {
    try {
      const result = await this.httpClient.put<Neighborhood>(`/neighborhoods/${id}`, data);
      return result;
    } catch (error) {
      console.error('Error in NeighborhoodRepository.update:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.httpClient.delete(`/neighborhoods/${id}`);
    } catch (error) {
      console.error('Error in NeighborhoodRepository.delete:', error);
      throw error;
    }
  }
}