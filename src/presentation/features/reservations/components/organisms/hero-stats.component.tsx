import { Calendar, Clock, User } from "lucide-react";

interface HeroStatsProps {
  stats: {
    total: number;
    active: number;
    past: number;
    pending: number;
    confirmed: number;
    rejected: number;
    cancelled: number;
  };
}

export function HeroStats({ stats }: HeroStatsProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <User className="h-8 w-8 text-blue-600" />
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Mis Reservas
          </h1>
        </div>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Gestiona todas tus reservas de escenarios deportivos desde un solo
          lugar
        </p>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>Activas: {stats.active}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-500" />
            <span>Confirmadas: {stats.confirmed}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span>Pendientes: {stats.pending}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span>Total: {stats.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
