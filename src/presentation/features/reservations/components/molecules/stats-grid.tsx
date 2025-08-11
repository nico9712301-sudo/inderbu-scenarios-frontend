import { useReservations } from "@/presentation/features/reservations/hooks/use-reservations.hook";
import { Calendar, MapPin, Users } from "lucide-react";
import { StatCard } from "../atoms/stat-card";

export const StatsGrid = ({
  stats,
}: {
  stats: ReturnType<typeof useReservations>["stats"];
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <StatCard
      title="Total Reservas"
      value={stats.total.toString()}
      Icon={Calendar}
      trend="up"
      changeLabel="+12% desde el mes pasado"
    />
    <StatCard
      title="Reservas Hoy"
      value={stats.today.toString()}
      Icon={Calendar}
      trend="up"
      changeLabel="+5% desde ayer"
    />
    <StatCard
      title="Escenarios Activos"
      value="—"
      Icon={MapPin}
      trend="neutral"
    />
    <StatCard
      title="Clientes Registrados"
      value="—"
      Icon={Users}
      trend="up"
      changeLabel="+3% desde el mes pasado"
    />
  </div>
);
