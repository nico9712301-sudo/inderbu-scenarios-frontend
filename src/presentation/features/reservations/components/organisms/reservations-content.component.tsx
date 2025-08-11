import { Pagination } from "@/shared/components/organisms/pagination";
import { ReservationDto } from "@/entities/reservation/model/types";
import { ReservationItem } from "./reservation-item";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/shared/ui/badge";

export function ReservationsContent({
  activeReservations,
  pastReservations,
  onEdit,
  onCancelled,
  pagination,
  onPageChange,
}: {
  activeReservations: ReservationDto[];
  pastReservations: ReservationDto[];
  onEdit: (reservation: ReservationDto) => void;
  onCancelled: (reservationId: number) => void;
  pagination: { currentPage: number; totalPages: number };
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="space-y-12">
      {/* Active Reservations */}
      {activeReservations.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-800">
                Reservas Activas
              </h2>
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                {activeReservations.length}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeReservations.map((reservation, index) => (
              <div key={reservation.id} className="relative">
                {index === 0 && activeReservations.length === 1 && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium shadow-lg animate-pulse">
                      👆 ¡Gestiona aquí!
                    </div>
                  </div>
                )}
                <ReservationItem
                  reservation={reservation}
                  isActive={true}
                  onModify={() => onEdit(reservation)}
                  onCancelled={onCancelled}
                  highlightManageButton={
                    index === 0 && activeReservations.length <= 3
                  }
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Past Reservations */}
      {pastReservations.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gray-400 rounded-full"></div>
              <h2 className="text-2xl font-bold text-gray-800">Historial</h2>
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                {pastReservations.length}
              </Badge>
            </div>

            <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                <CheckCircle2 className="h-3 w-3" />
                <span>Reservas completadas o canceladas</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastReservations.map((reservation) => (
              <ReservationItem
                key={reservation.id}
                reservation={reservation}
                isActive={false}
                onModify={() => onEdit(reservation)}
                onCancelled={onCancelled}
              />
            ))}
          </div>
        </section>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
