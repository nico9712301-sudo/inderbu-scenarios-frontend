import { Button } from "@/shared/ui/button";
import { Calendar, Plus } from "lucide-react";

export function EmptyState({
  hasFilters,
  onClearFilters,
  onCreateNew,
}: {
  hasFilters: boolean;
  onClearFilters: () => void;
  onCreateNew: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-full p-8 mb-6">
        <Calendar className="w-16 h-16 text-gray-400" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-800 mb-3">
        {hasFilters ? "No se encontraron reservas" : "No tienes reservas"}
      </h3>
      <p className="text-center text-gray-600 mb-6 max-w-md leading-relaxed">
        {hasFilters
          ? "Intenta con otros términos de búsqueda o limpia los filtros."
          : "Cuando reserves un escenario deportivo, aparecerá aquí para que puedas gestionarlo fácilmente."}
      </p>
      {hasFilters ? (
        <Button variant="outline" onClick={onClearFilters}>
          Limpiar filtros
        </Button>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={onCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Crear Primera Reserva
          </Button>
          <Button variant="outline" asChild>
            <a href="/">Explorar Escenarios</a>
          </Button>
        </div>
      )}
    </div>
  );
}
