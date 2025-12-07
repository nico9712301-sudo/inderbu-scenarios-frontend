import { useReservations } from "@/presentation/features/reservations/hooks/use-reservations.hook";
import { Calendar, MapPin, Users } from "lucide-react";
import { StatCard } from "../atoms/stat-card";

export const StatsGrid = ({
  stats,
}: {
  stats: ReturnType<typeof useReservations>["stats"];
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-2">
    <StatCard
      title="Total Reservas"
      value={stats.total.toString()}
      Icon={Calendar}
      trend="up"
      // changeLabel="+12% desde el mes pasado"
    />
    <StatCard
      title="Escenarios Activos"
      value={stats.activeScenarios.toString()}
      Icon={MapPin}
      trend="up"
    />
    <StatCard
      title="Clientes Registrados"
      value={stats.registeredClients.toString()}
      Icon={Users}
      trend="up"
      // changeLabel="+3% desde el mes pasado"
    />
  </div>
);
