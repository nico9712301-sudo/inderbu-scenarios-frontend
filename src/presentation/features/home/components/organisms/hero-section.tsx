export function HeroSection() {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-gray-50 py-12">
      <div className="container mx-auto px-4 text-center">
        <h1
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-green-600 
                     bg-clip-text text-transparent mb-4"
        >
          Reserva tu espacio deportivo
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Descubre y reserva los mejores{" "}
          <span className="font-semibold text-blue-600">
            escenarios deportivos
          </span>{" "}
          de Bucaramanga y su area metropolitana con INDERBÚ
        </p>
        <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Reservas gratuitas disponibles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Múltiples ubicaciones</span>
          </div>
        </div>
      </div>
    </div>
  );
}
