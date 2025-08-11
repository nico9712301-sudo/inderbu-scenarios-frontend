import { IUser } from "@/shared/interfaces/user.interface";
import { Button } from "@/shared/ui/button";
import { AlertCircle } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function UserNotFound({
    user,
    router
}: {
    user: IUser | null,
    router: AppRouterInstance
}) {
    return <div className="flex-grow flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-50">
        <div className="text-center max-w-md bg-white p-8 rounded-lg shadow-lg">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Error de Usuario
            </h2>
            <p className="text-gray-600 mb-4">
                No se pudo obtener el ID del usuario del token.
            </p>
            <div className="text-left bg-gray-100 p-4 rounded-lg mb-4">
                <p className="text-sm font-mono">
                    <strong>User object:</strong>
                    <br />
                    {JSON.stringify(user, null, 2)}
                </p>
            </div>
            <Button onClick={() => router.push("/")}>Volver al inicio</Button>
        </div>
    </div>
}