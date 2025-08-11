import { CalendarCheck } from "lucide-react";

export function WelcomeBanner() {
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 border-2 border-dashed border-blue-300 rounded-xl p-6 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-start gap-4">
            <div className="bg-primary rounded-full p-3 shadow-lg">
              <CalendarCheck className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                ¡Bienvenido a tu panel de reservas!
              </h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Desde aquí puedes <strong>gestionar todas tus reservas</strong> de manera
                fácil y rápida. 📱 Solo haz clic en el botón azul{" "}
                <strong>"Gestionar reserva"</strong> en cualquier tarjeta.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-semibold text-green-700 text-sm">
                      Cambiar Estado
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Pendiente → Confirmada</p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-semibold text-blue-700 text-sm">
                      Cambiar Fecha
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Nueva reserva automática</p>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="font-semibold text-red-700 text-sm">Cancelar</span>
                  </div>
                  <p className="text-xs text-gray-600">Con confirmación segura</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}