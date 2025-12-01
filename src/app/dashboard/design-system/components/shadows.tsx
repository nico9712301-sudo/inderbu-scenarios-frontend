export function Shadows() {
  const shadows = [
    {
      name: "shadow-xs",
      css: "--shadow-xs",
      value: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      description: "Sombra extra pequeña para elementos sutiles"
    },
    {
      name: "shadow-sm",
      css: "--shadow-sm",
      value: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      description: "Sombra pequeña para tarjetas básicas"
    },
    {
      name: "shadow-md",
      css: "--shadow-md",
      value: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      description: "Sombra media para elementos elevados"
    },
    {
      name: "shadow-lg",
      css: "--shadow-lg",
      value: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      description: "Sombra grande para modales y overlays"
    },
    {
      name: "shadow-xl",
      css: "--shadow-xl",
      value: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      description: "Sombra extra grande para elementos flotantes"
    }
  ];

  const tailwindShadows = [
    { name: "shadow-none", description: "Sin sombra" },
    { name: "shadow-sm", description: "Sombra pequeña" },
    { name: "shadow", description: "Sombra por defecto" },
    { name: "shadow-md", description: "Sombra media" },
    { name: "shadow-lg", description: "Sombra grande" },
    { name: "shadow-xl", description: "Sombra extra grande" },
    { name: "shadow-2xl", description: "Sombra 2x grande" },
    { name: "shadow-inner", description: "Sombra interior" }
  ];

  return (
    <div className="space-y-8">
      {/* Custom Shadow Variables */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Variables de Sombra Personalizadas
        </h3>
        <p className="text-muted-foreground">
          Sombras modernas definidas en CSS custom properties para efectos de profundidad.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shadows.map((shadow) => (
            <div key={shadow.name} className="space-y-4">
              <div
                className="bg-card p-6 rounded-lg border border-border min-h-[120px] flex items-center justify-center"
                style={{ boxShadow: shadow.value }}
              >
                <div className="text-center">
                  <code className="text-sm font-mono text-primary">
                    {shadow.name}
                  </code>
                  <p className="text-xs text-muted-foreground mt-2">
                    {shadow.description}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <code className="text-xs text-muted-foreground block">
                  {shadow.css}
                </code>
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono break-all">
                  {shadow.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tailwind Shadow Classes */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Clases de Sombra Tailwind
        </h3>
        <p className="text-muted-foreground">
          Las clases de sombra de Tailwind CSS disponibles en el sistema.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tailwindShadows.map((shadow) => (
            <div key={shadow.name} className="space-y-3">
              <div className={`bg-card p-6 rounded-lg border border-border min-h-[100px] flex items-center justify-center ${shadow.name}`}>
                <code className="text-sm font-mono text-primary">
                  {shadow.name}
                </code>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {shadow.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Shadow Usage Examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Ejemplos de Uso
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Examples */}
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-foreground">Tarjetas</h4>

            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <h5 className="font-medium text-card-foreground mb-2">Tarjeta Básica</h5>
              <p className="text-sm text-muted-foreground mb-3">
                Con sombra sutil para separar del fondo.
              </p>
              <code className="text-xs text-muted-foreground">shadow-sm</code>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 shadow-md">
              <h5 className="font-medium text-card-foreground mb-2">Tarjeta Elevada</h5>
              <p className="text-sm text-muted-foreground mb-3">
                Con sombra media para mayor prominencia.
              </p>
              <code className="text-xs text-muted-foreground">shadow-md</code>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
              <h5 className="font-medium text-card-foreground mb-2">Tarjeta Flotante</h5>
              <p className="text-sm text-muted-foreground mb-3">
                Con sombra grande para efecto flotante.
              </p>
              <code className="text-xs text-muted-foreground">shadow-lg</code>
            </div>
          </div>

          {/* Interactive Examples */}
          <div className="space-y-6">
            <h4 className="text-lg font-medium text-foreground">Elementos Interactivos</h4>

            <div className="space-y-4">
              <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                Botón con Hover Shadow
              </button>
              <code className="text-xs text-muted-foreground block">
                shadow-sm hover:shadow-md
              </code>
            </div>

            <div className="space-y-4">
              <div className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                <p className="text-sm text-card-foreground">
                  Hover para ver efecto de sombra
                </p>
              </div>
              <code className="text-xs text-muted-foreground block">
                shadow-sm hover:shadow-xl
              </code>
            </div>

            <div className="space-y-4">
              <div className="bg-background border-2 border-primary/20 rounded-lg p-4 shadow-inner">
                <p className="text-sm text-foreground">
                  Campo con sombra interior
                </p>
              </div>
              <code className="text-xs text-muted-foreground block">
                shadow-inner
              </code>
            </div>

            <div className="space-y-4">
              <div className="bg-card rounded-lg p-6 shadow-2xl border border-border">
                <h5 className="font-medium text-card-foreground mb-2">Modal Simulado</h5>
                <p className="text-sm text-muted-foreground">
                  Sombra extra grande para simular un modal.
                </p>
              </div>
              <code className="text-xs text-muted-foreground block">
                shadow-2xl
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* Color Shadows */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Sombras con Color
        </h3>
        <p className="text-muted-foreground">
          Ejemplos de sombras personalizadas con los colores de la marca.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="bg-card rounded-lg p-6 border border-border"
            style={{ boxShadow: "0 10px 15px -3px hsl(103, 100%, 36% / 0.2), 0 4px 6px -4px hsl(103, 100%, 36% / 0.1)" }}
          >
            <h5 className="font-medium text-card-foreground mb-2">Sombra Verde</h5>
            <p className="text-sm text-muted-foreground">
              Con color primario INDERBU
            </p>
            <code className="text-xs text-muted-foreground">
              primary shadow
            </code>
          </div>

          <div
            className="bg-card rounded-lg p-6 border border-border"
            style={{ boxShadow: "0 10px 15px -3px hsl(217, 91%, 60% / 0.2), 0 4px 6px -4px hsl(217, 91%, 60% / 0.1)" }}
          >
            <h5 className="font-medium text-card-foreground mb-2">Sombra Azul</h5>
            <p className="text-sm text-muted-foreground">
              Con color secundario institucional
            </p>
            <code className="text-xs text-muted-foreground">
              secondary shadow
            </code>
          </div>

          <div
            className="bg-card rounded-lg p-6 border border-border"
            style={{ boxShadow: "0 10px 15px -3px hsl(0, 84.2%, 60.2% / 0.2), 0 4px 6px -4px hsl(0, 84.2%, 60.2% / 0.1)" }}
          >
            <h5 className="font-medium text-card-foreground mb-2">Sombra Roja</h5>
            <p className="text-sm text-muted-foreground">
              Para alertas y elementos destructivos
            </p>
            <code className="text-xs text-muted-foreground">
              destructive shadow
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}