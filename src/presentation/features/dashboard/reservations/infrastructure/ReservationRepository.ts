import { 
  IReservationRepository, 
  PaginatedReservations, 
  ReservationFilters 
} from '../domain/repositories/IReservationRepository';
import { ReservationDto } from '@/services/reservation.service';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { createServerAuthContext } from '@/shared/api/server-auth';

/** Convierte la respuesta cruda a nuestro DTO con compatibilidad legacy. */
function normalizeReservation(api: any): ReservationDto {
  const firstSlot = (api.timeslots ?? [])[0];

  return {
    ...api,
    reservationDate: api.initialDate, // alias para UI actual
    timeSlot: firstSlot,
    timeSlotId: firstSlot?.id,
    subScenario: {
      /* relleno de campos legacy para que no fallen lecturas previas */
      hasCost: false,
      numberOfSpectators: null,
      numberOfPlayers: null,
      recommendations: null,
      scenarioId: api.subScenario?.scenarioId ?? 0,
      scenarioName: api.subScenario?.scenarioName ?? "",
      scenario: api.subScenario?.scenario,
      ...api.subScenario,
    },
  } as ReservationDto;
}

export class ReservationRepository implements IReservationRepository {
  
  async getAllWithPagination(filters: ReservationFilters): Promise<PaginatedReservations> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Build query params (igual que el service original)
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && `${val}`.trim() !== "") {
          params.set(key, `${val}`);
        }
      });

      // CORRECTO - Usar el endpoint correcto: /reservations (no /reservations/paginated)
      const endpoint = `/reservations${params.toString() ? '?' + params.toString() : ''}`;

      // Direct API call with authentication
      const response = await httpClient.get<{
        data: any[];
        meta: {
          page: number;
          limit: number;
          totalItems: number;
          totalPages: number;
        };
      }>(endpoint);

      // CORRECTO - Normalizar datos igual que el service original
      return {
        data: response.data.map(normalizeReservation),
        meta: response.meta,
      };
    } catch (error) {
      console.error('Error in ReservationRepository.getAllWithPagination:', error);
      throw error;
    }
  }

  async getAll(filters: Record<string, any> = {}): Promise<ReservationDto[]> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Build query params
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && `${val}`.trim() !== "") {
          params.set(key, `${val}`);
        }
      });

      const endpoint = `/reservations${params.toString() ? '?' + params.toString() : ''}`;

      // Direct API call with authentication
      const response = await httpClient.get<{ data: any[] }>(endpoint);

      // CORRECTO - Normalizar datos igual que el service original
      return response.data.map(normalizeReservation);
    } catch (error) {
      console.error('Error in ReservationRepository.getAll:', error);
      throw error;
    }
  }

  async updateState(reservationId: number, reservationStateId: number): Promise<ReservationDto> {
    try {
      // CORRECTO - Con autenticación desde servidor
      const authContext = createServerAuthContext();
      const httpClient = ClientHttpClientFactory.createClient(authContext);

      // Direct API call with authentication
      const result = await httpClient.patch<any>(
        `/reservations/${reservationId}/state`,
        { reservationStateId }
      );

      // CORRECTO - Normalizar datos igual que el service original
      return normalizeReservation(result);
    } catch (error) {
      console.error('Error in ReservationRepository.updateState:', error);
      throw error;
    }
  }
}
