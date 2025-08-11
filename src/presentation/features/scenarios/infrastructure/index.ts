// Infrastructure Layer Exports (DDD Architecture - Client Safe)

export { TimeSlotRepositoryAdapter, timeSlotApiService } from './timeSlotRepository';
// NOTE: ReservationRepositoryAdapter replaced by server actions
// export { ReservationRepositoryAdapter, reservationApiService } from './reservationRepository';
export { CleanScenarioRepositoryAdapter, scenarioApiService } from './scenarioRepository';

// Clean exports - no server contamination
// Reservation creation now uses server actions for proper auth handling