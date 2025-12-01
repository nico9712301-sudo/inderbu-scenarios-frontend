"use client";

export function Animations() {
  return (
    <div className="space-y-8">
      {/* Accordion Animations */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Animaciones de Acordeón
        </h3>
        <p className="text-muted-foreground">
          Animaciones para componentes que se expanden y contraen.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h4 className="font-medium text-card-foreground mb-4">Accordion Down</h4>
            <div className="bg-muted rounded overflow-hidden">
              <div className="animate-accordion-down bg-primary/20 p-4">
                <p className="text-sm text-foreground">
                  Contenido que se expande hacia abajo
                </p>
              </div>
            </div>
            <code className="text-xs text-muted-foreground mt-2 block">
              animate-accordion-down
            </code>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h4 className="font-medium text-card-foreground mb-4">Accordion Up</h4>
            <div className="bg-muted rounded overflow-hidden">
              <div className="animate-accordion-up bg-primary/20 p-4">
                <p className="text-sm text-foreground">
                  Contenido que se contrae hacia arriba
                </p>
              </div>
            </div>
            <code className="text-xs text-muted-foreground mt-2 block">
              animate-accordion-up
            </code>
          </div>
        </div>
      </div>

      {/* Loading Animations */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Animaciones de Carga
        </h3>
        <p className="text-muted-foreground">
          Efectos visuales para estados de carga y skeleton screens.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full animate-spin"></div>
            <h4 className="font-medium text-card-foreground mb-2">Spin</h4>
            <code className="text-xs text-muted-foreground">animate-spin</code>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-16 h-4 mx-auto mb-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded animate-pulse"></div>
            <h4 className="font-medium text-card-foreground mb-2">Pulse</h4>
            <code className="text-xs text-muted-foreground">animate-pulse</code>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-16 h-4 mx-auto mb-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded animate-bounce"></div>
            <h4 className="font-medium text-card-foreground mb-2">Bounce</h4>
            <code className="text-xs text-muted-foreground">animate-bounce</code>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-16 h-4 mx-auto mb-4 shimmer rounded"></div>
            <h4 className="font-medium text-card-foreground mb-2">Shimmer</h4>
            <code className="text-xs text-muted-foreground">shimmer (custom)</code>
          </div>
        </div>
      </div>

      {/* Modern Loading Effects */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Efectos Modernos de Carga
        </h3>
        <p className="text-muted-foreground">
          Animaciones personalizadas para experiencias de usuario mejoradas.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded animate-shimmer-modern relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>
            <h4 className="font-medium text-card-foreground mb-2">Shimmer Modern</h4>
            <code className="text-xs text-muted-foreground">animate-shimmer-modern</code>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-secondary/20 rounded-full animate-breathe"></div>
            <h4 className="font-medium text-card-foreground mb-2">Breathe</h4>
            <code className="text-xs text-muted-foreground">animate-breathe</code>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-accent rounded animate-pulse-glow relative">
              <div className="absolute inset-0 bg-primary/30 rounded animate-pulse-glow"></div>
            </div>
            <h4 className="font-medium text-card-foreground mb-2">Pulse Glow</h4>
            <code className="text-xs text-muted-foreground">animate-pulse-glow</code>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-complementary/50 rounded animate-float"></div>
            <h4 className="font-medium text-card-foreground mb-2">Float</h4>
            <code className="text-xs text-muted-foreground">animate-float</code>
          </div>
        </div>
      </div>

      {/* Transition Examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Transiciones Comunes
        </h3>
        <p className="text-muted-foreground">
          Transiciones CSS para interacciones de usuario.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg transition-colors hover:bg-primary/80">
              Color Transition
            </button>
            <code className="text-xs text-muted-foreground mt-2 block">
              transition-colors
            </code>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg transition-transform hover:scale-105">
              Transform Transition
            </button>
            <code className="text-xs text-muted-foreground mt-2 block">
              transition-transform hover:scale-105
            </code>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <button className="bg-accent text-accent-foreground px-4 py-2 rounded-lg transition-shadow hover:shadow-lg">
              Shadow Transition
            </button>
            <code className="text-xs text-muted-foreground mt-2 block">
              transition-shadow hover:shadow-lg
            </code>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <button className="bg-muted text-muted-foreground px-4 py-2 rounded-lg transition-opacity hover:opacity-80">
              Opacity Transition
            </button>
            <code className="text-xs text-muted-foreground mt-2 block">
              transition-opacity hover:opacity-80
            </code>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg transition-all hover:bg-destructive/80 hover:scale-105">
              All Transition
            </button>
            <code className="text-xs text-muted-foreground mt-2 block">
              transition-all hover:scale-105
            </code>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <div className="w-12 h-12 mx-auto bg-primary rounded-full transition-all duration-500 hover:rotate-180 hover:bg-secondary"></div>
            <code className="text-xs text-muted-foreground mt-2 block">
              duration-500 hover:rotate-180
            </code>
          </div>
        </div>
      </div>

      {/* Fade In Animation */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Animación Fade In
        </h3>
        <p className="text-muted-foreground">
          Animación personalizada para elementos que aparecen.
        </p>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((item, index) => (
              <div
                key={item}
                className="bg-primary/10 p-4 rounded-lg text-center"
                style={{
                  animation: `fadeInUp 0.6s ease-out ${index * 0.2}s both`
                }}
              >
                <div className="w-8 h-8 mx-auto mb-2 bg-primary rounded-full"></div>
                <p className="text-sm text-foreground">Item {item}</p>
              </div>
            ))}
          </div>
          <code className="text-xs text-muted-foreground mt-4 block">
            fadeInUp (keyframe personalizada)
          </code>
        </div>
      </div>

      {/* Glass Effect */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Efecto Glass (Glassmorphism)
        </h3>
        <p className="text-muted-foreground">
          Efecto de cristal moderno con backdrop-filter.
        </p>
        <div className="relative bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-lg p-8 min-h-[200px]">
          <div className="glass-effect rounded-lg p-6 max-w-md">
            <h4 className="font-medium text-foreground mb-2">Tarjeta Glass</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Efecto de cristal con blur y transparencia para un look moderno.
            </p>
            <button className="bg-primary/80 text-primary-foreground px-4 py-2 rounded-lg backdrop-blur-sm">
              Botón Glass
            </button>
          </div>
          <code className="text-xs text-muted-foreground mt-4 block">
            glass-effect (clase personalizada)
          </code>
        </div>
      </div>

      {/* Performance Notes */}
      <div className="bg-muted/50 border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">
          Notas de Rendimiento
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Las animaciones de <code>transform</code> y <code>opacity</code> son las más performantes</li>
          <li>• Evita animar propiedades que causan reflow como <code>width</code>, <code>height</code>, <code>top</code>, <code>left</code></li>
          <li>• Usa <code>will-change</code> solo cuando sea necesario y remuévelo después de la animación</li>
          <li>• Prefiere <code>transform: translateZ(0)</code> para forzar aceleración por hardware</li>
          <li>• Las animaciones CSS son generalmente más eficientes que las de JavaScript</li>
          <li>• Considera <code>reduced-motion</code> para usuarios con preferencias de accesibilidad</li>
        </ul>
      </div>
    </div>
  );
}