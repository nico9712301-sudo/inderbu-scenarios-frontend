import { Palette, Shadows, Spacing, Typography, Animations } from "./components";

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            INDERBU Design System
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Una guía visual completa de todas las propiedades de diseño definidas en{" "}
            <code className="bg-muted px-2 py-1 rounded text-sm">globals.css</code>.
            Explora colores, tipografía, espaciado, sombras y animaciones del sistema.
          </p>
        </div>

        {/* Color Palette */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-foreground mb-2">
              Paleta de Colores
            </h2>
            <p className="text-muted-foreground">
              Sistema de colores INDERBU con variaciones y casos de uso
            </p>
          </div>
          <Palette />
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-foreground mb-2">
              Tipografía
            </h2>
            <p className="text-muted-foreground">
              Jerarquía tipográfica y estilos de texto
            </p>
          </div>
          <Typography />
        </section>

        {/* Spacing */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-foreground mb-2">
              Sistema de Espaciado
            </h2>
            <p className="text-muted-foreground">
              Espacios consistentes para mantener ritmo visual
            </p>
          </div>
          <Spacing />
        </section>

        {/* Shadows */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-foreground mb-2">
              Sistema de Sombras
            </h2>
            <p className="text-muted-foreground">
              Elevación y profundidad visual moderna
            </p>
          </div>
          <Shadows />
        </section>

        {/* Animations */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-foreground mb-2">
              Animaciones
            </h2>
            <p className="text-muted-foreground">
              Efectos de movimiento y transiciones
            </p>
          </div>
          <Animations />
        </section>
      </div>
    </div>
  );
}