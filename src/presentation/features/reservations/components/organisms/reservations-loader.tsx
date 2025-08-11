import { Loader2 } from "lucide-react";

export function ReservationsLoader() {
    return (
        <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50">
            <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Cargando tus reservas
                </h2>
                <p className="text-gray-600">Un momento por favor...</p>
            </div>
        </div>
    );
}