import { Button } from "@/shared/ui/button";
import { AlertCircle } from "lucide-react";

export function ErrorLoadingComponent({ refetch }: { refetch: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Error al cargar reservas
        </h3>
        <p className="text-red-600 mb-4">Ha ocurrido un error inesperado</p>
        <Button onClick={() => refetch()} variant="outline">
          Intentar nuevamente
        </Button>
      </div>
    </div>
  );
}
