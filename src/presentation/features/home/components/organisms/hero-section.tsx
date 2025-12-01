import { HomeSlide } from "@/shared/api/home-slides";
import { MainCarousel } from "@/shared/components/organisms/main-carousel";

interface HeroSectionProps {
  slides?: HomeSlide[];
}

export function HeroSection({ slides }: HeroSectionProps) {
  console.log('HeroSection: Rendering with slides:', slides);
  
  if (slides && slides.length > 0) {
    return <MainCarousel slides={slides} />;
  }

  // Fallback to static hero when no slides available
  return (
    <div className="bg-gradient-to-br from-muted via-background to-muted py-12">
      <div className="container mx-auto px-4 text-center">
        <h1
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-secondary-600 to-primary-600 
                     bg-clip-text text-transparent mb-4"
        >
          Reserva tu espacio deportivo
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Descubre y reserva los mejores{" "}
          <span className="font-semibold text-secondary-600">
            escenarios deportivos
          </span>{" "}
          de Bucaramanga y su area metropolitana con INDERBÚ
        </p>
        <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
            <span>Reservas gratuitas disponibles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-secondary-600 rounded-full"></div>
            <span>Múltiples ubicaciones</span>
          </div>
        </div>
      </div>
    </div>
  );
}
