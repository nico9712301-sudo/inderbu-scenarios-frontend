import ReservationService, {
  ReservationStateDto,
} from "@/services/reservation.service";
import { useEffect, useState } from "react";

export const useReservationStates = () => {
  const [states, setStates] = useState<ReservationStateDto[]>([]);
  const [loading, setLoading] = useState(true); // 🔥 CAMBIO: Empezar con loading = true
  const [error, setError] = useState<Error | null>(null);

  const fetchStates = async () => {
    try {
      setLoading(true);
      const data = await ReservationService.getAllReservationStates();
      setStates(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch reservation states"),
      );
      console.error("Error fetching reservation states:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  return {
    states,
    loading,
    error,
    refetch: fetchStates,
  };
};
