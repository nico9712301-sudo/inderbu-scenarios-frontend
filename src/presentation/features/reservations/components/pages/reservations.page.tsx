import { PaginatedReservations } from '@/entities/reservation/model/types';
import { UserReservationsGuard } from '@/presentation/features/auth';
import { ReservationsContainer } from '@/presentation/features/reservations/components/organisms/reservations-container.component';
import { MainHeader } from '@/shared/components/organisms/main-header';

// Updated interface to include access metadata from DDD use case
interface ReservationsPageProps {
  userId: number;
  initialData?: PaginatedReservations | null;
}

// Atomic: Page-level component (template with real data)
// FSD: Template layer - orchestrates widgets and features
export function ReservationsPage({ 
  userId, 
  initialData, 
}: ReservationsPageProps) {
  return (
    <main className="min-h-screen flex flex-col">
      <MainHeader />

      {/* Feature: Auth guard handles client-side protection */}
      <UserReservationsGuard userId={userId}>
        {/* Widget: Complex orchestration component */}
        <ReservationsContainer
          userId={userId}
          initialData={initialData}
        />
      </UserReservationsGuard>
    </main>
  );
}
