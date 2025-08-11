import { Button } from "@/shared/ui/button";
import { AlertCircle } from "lucide-react";

export function ErrorReservationsLoading({
    error,
    refetch
}: {
    error: string | null;
    refetch: () => void;
}) {
    return (
        <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-50">
            <div className="text-center max-w-md">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Error al cargar reservas
                </h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={refetch}>Intentar de nuevo</Button>
            </div>
        </div>
    );
}