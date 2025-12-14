"use client";

import { AuthModal } from "@/presentation/features/auth";
import { useAuth } from "@/presentation/features/auth/model/use-auth";
import { CreateReservationDto } from '@/entities/reservation/model/types';
import { TimeSlots } from "@/presentation/features/scenarios/components/organisms/time-slots";
import { getTodayLocalISO } from "@/shared/utils/utils";
import { SimpleCalendar } from "@/shared/components/organisms/simple-calendar";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { useState } from "react";
import { FiCalendar, FiCheck, FiClock, FiLoader } from "react-icons/fi";
import { toast } from "sonner";
import { createReservation } from '@/infrastructure/web/controllers/create-reservation.action';

interface IReservationPanelProps {
  subScenarioId: number;
}

export function ReservationPanel({ subScenarioId }: IReservationPanelProps) {
  const today = getTodayLocalISO();
  const [date, setDate] = useState(today);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<number | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { isAuthenticated } = useAuth();

  // --- handlers -------------------------------------------------------------
  const doReservation = async () => {
    if (!selectedTimeSlotId) {
      toast.error("Por favor selecciona un horario para reservar");
      return;
    }
    setIsSubmitting(true);
    try {
      const command: CreateReservationDto = {
        subScenarioId,
        timeSlotIds: [selectedTimeSlotId],
        reservationRange: {
          initialDate: date,
        },
      };
      
      const result = await createReservation(command);
      
      if (result.success) {
        toast.success("¡Reserva realizada con éxito!");
        setSelectedTimeSlotId(null);
        setRefreshTrigger((r) => r + 1);
      } else {
        // Limpiar la selección cuando hay un error
        setSelectedTimeSlotId(null);
        console.error('Server action failed:', result.error);
        // Show the exact error message from the backend
        toast.error(result.error || "No se pudo completar la reserva", {
          description: result.error ? undefined : "Por favor, intenta de nuevo",
        });
      }
      
    } catch (err) {
      // Limpiar la selección cuando hay un error en el catch
      setSelectedTimeSlotId(null);
      console.error('Server Action error (caught in try/catch):', err);
      console.error('Error type:', err?.constructor?.name);
      console.error('Error message:', err instanceof Error ? err.message : 'Unknown');
      console.error('Error details:', (err as any)?.details);
      
      // Try to extract error message from the caught error
      let errorMessage = "No se pudo completar la reserva, inténtalo de nuevo";
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Check for conflict details in the error
        const errorDetails = (err as any)?.details;
        if (errorDetails && errorDetails.conflicts && Array.isArray(errorDetails.conflicts)) {
          const conflictMessages = errorDetails.conflicts.map((c: any) => {
            return `Fecha ${c.date}, horario ${c.timeslotId}`;
          });
          errorMessage = `${errorMessage}. Conflictos en: ${conflictMessages.join('; ')}`;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = () => {
    if (!isAuthenticated) setIsLoginModalOpen(true);
    else doReservation();
  };

  const handleLoginSuccess = (
    // id: number,
    // email: string,
    // role: number,
    // token: string,
  ) => {
    // login(id, email, role, token);
    doReservation();
  };

  // --- JSX ------------------------------------------------------------------
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Reserva tu espacio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Selecciona una fecha y horario para reservar esta instalación.
          </p>

          <section>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <FiCalendar className="text-primary-600" /> Selecciona una fecha
            </h3>
            <SimpleCalendar selectedDate={date} onDateChange={setDate} />
          </section>

          <section className="mt-4">
            <h3 className="text-lg font-medium flex items-center gap-2 pb-2">
              <FiClock className="text-primary-600" /> Horarios disponibles
            </h3>
            <TimeSlots
              subScenarioId={subScenarioId}
              date={date}
              onSelectTimeSlot={setSelectedTimeSlotId}
              selectedTimeSlotId={selectedTimeSlotId}
              refreshTrigger={refreshTrigger}
            />
          </section>

          <Button
            className="w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center gap-2"
            onClick={onSubmit}
            disabled={!selectedTimeSlotId || isSubmitting}
          >
            {isSubmitting ? (
              <FiLoader className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <FiCheck className="h-5 w-5 mr-2" />
            )}
            {isSubmitting ? "Procesando..." : "Confirmar reserva"}
          </Button>

          {!selectedTimeSlotId && (
            <p className="text-sm text-gray-500 mt-2 text-center">
              Selecciona un horario disponible para continuar
            </p>
          )}
        </CardContent>
      </Card>

      <AuthModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}
