import ReservationService, {
  ReservationDto,
} from "@/services/reservation.service";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Filters = {
  scenarioId?: number;
  activityAreaId?: number;
  neighborhoodId?: number;
  userId?: number;
  // NUEVOS FILTROS DE FECHA
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
};

export const useReservations = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Leer parámetros de paginación de la URL o usar valores predeterminados
  const defaultPage = 1;
  const defaultPageSize = 7;

  const urlPage = searchParams.get("page")
    ? parseInt(searchParams.get("page")!)
    : defaultPage;
  const urlPageSize = searchParams.get("pageSize")
    ? parseInt(searchParams.get("pageSize")!)
    : defaultPageSize;

  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [page, setPage] = useState(urlPage);
  const [pageSize] = useState(urlPageSize); // Fijo en 7, pero obtenido de URL si existe
  const [totalReservations, setTotalReservations] = useState(0);

  // Estado de filtros
  const [filters, setFilters] = useState<Filters>({});
  const [meta, setMeta] = useState({
    page: urlPage,
    limit: urlPageSize,
    totalItems: 0,
    totalPages: 0,
  });

  // Función para obtener reservas paginadas con filtros
  const fetchReservations = async (
    pageNumber = page,
    currentFilters = filters,
  ) => {
    setLoading(true);
    try {
      console.log("Fetching reservations with filters:", currentFilters);

      const result = await ReservationService.getAllReservationsWithPagination({
        page: pageNumber,
        limit: pageSize,
        ...currentFilters,
      });

      setReservations(result.data);
      setMeta(result.meta);
      setTotalReservations(result.meta.totalItems);

      return result.data;
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setReservations([]);
      setMeta({
        page: pageNumber,
        limit: pageSize,
        totalItems: 0,
        totalPages: 0,
      });
      setTotalReservations(0);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar de página
  const changePage = async (newPage: number) => {
    // Actualizar URL con los nuevos parámetros de paginación
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    params.set("pageSize", pageSize.toString());

    // Navegar a la nueva URL con los parámetros actualizados
    router.push(`/dashboard?${params.toString()}`);

    // Actualizar estado local y cargar datos
    setPage(newPage);
    await fetchReservations(newPage, filters);
  };

  // Función para manejar cambios en filtros
  const handleFiltersChange = (newFilters: Filters) => {
    console.log("Filters changed:", newFilters);
    setFilters(newFilters);
    setPage(1); // Resetear a la primera página cuando cambian los filtros
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  // Cargar reservaciones cuando cambian parámetros de URL, filtros o al montar el componente
  useEffect(() => {
    fetchReservations(page, filters);
  }, [page, filters, urlPage, urlPageSize]); // Re-ejecutar cuando cambien los parámetros de URL o filtros

  /* ---------- derived state (memoised) ---------- */
  const stats = useMemo(() => {
    const fetchAllReservations = async () => {
      const allData = await ReservationService.getAllReservations();
      const today = new Date().toISOString().split("T")[0];
      const todayQty = allData.filter(
        (r) => r.reservationDate === today,
      ).length;

      return {
        total: allData.length,
        today: todayQty,
        approved: allData.filter((r) => r.reservationStateId === 2).length,
        pending: allData.filter((r) => r.reservationStateId === 1).length,
        rejected: allData.filter((r) => r.reservationStateId === 3).length,
      };
    };

    // Llamamos a fetchAllReservations inicialmente
    fetchAllReservations();

    // Mientras tanto, devolvemos stats calculadas con los datos actuales
    const today = new Date().toISOString().split("T")[0];
    const todayQty = reservations.filter(
      (r) => r.reservationDate === today,
    ).length;

    return {
      total: totalReservations,
      today: todayQty,
      approved: reservations.filter((r) => r.reservationStateId === 2).length,
      pending: reservations.filter((r) => r.reservationStateId === 1).length,
      rejected: reservations.filter((r) => r.reservationStateId === 3).length,
    };
  }, [reservations, totalReservations]);

  return {
    reservations,
    setReservations,
    isLoading,
    stats,
    refetch: fetchReservations,
    page,
    pageSize,
    totalReservations,
    changePage,
    // Nuevos campos para filtros
    filters,
    handleFiltersChange,
    clearFilters,
    meta,
  };
};
