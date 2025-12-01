export function Spacing() {
  const spacingValues = [
    { name: "xs", value: "0.25rem", css: "--space-xs" },
    { name: "sm", value: "0.5rem", css: "--space-sm" },
    { name: "md", value: "1rem", css: "--space-md" },
    { name: "lg", value: "1.5rem", css: "--space-lg" },
    { name: "xl", value: "2rem", css: "--space-xl" },
    { name: "2xl", value: "3rem", css: "--space-2xl" },
    { name: "3xl", value: "4rem", css: "--space-3xl" }
  ];

  const tailwindSpacing = [
    { name: "0", value: "0" },
    { name: "px", value: "1px" },
    { name: "0.5", value: "0.125rem" },
    { name: "1", value: "0.25rem" },
    { name: "1.5", value: "0.375rem" },
    { name: "2", value: "0.5rem" },
    { name: "2.5", value: "0.625rem" },
    { name: "3", value: "0.75rem" },
    { name: "3.5", value: "0.875rem" },
    { name: "4", value: "1rem" },
    { name: "5", value: "1.25rem" },
    { name: "6", value: "1.5rem" },
    { name: "7", value: "1.75rem" },
    { name: "8", value: "2rem" },
    { name: "9", value: "2.25rem" },
    { name: "10", value: "2.5rem" },
    { name: "11", value: "2.75rem" },
    { name: "12", value: "3rem" },
    { name: "14", value: "3.5rem" },
    { name: "16", value: "4rem" },
    { name: "20", value: "5rem" },
    { name: "24", value: "6rem" }
  ];

  return (
    <div className="space-y-8">
      {/* Custom Spacing Variables */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Variables de Espaciado Personalizado
        </h3>
        <p className="text-muted-foreground">
          Espaciado definido en CSS custom properties para mantener consistencia.
        </p>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="space-y-6">
            {spacingValues.map((space) => (
              <div key={space.name} className="flex items-center gap-6">
                <div className="flex items-center gap-4 min-w-[200px]">
                  <code className="text-sm font-mono text-muted-foreground">
                    {space.css}
                  </code>
                  <span className="text-sm text-foreground">
                    {space.value}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="bg-primary h-4 rounded"
                    style={{ width: space.value }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {space.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tailwind Spacing Scale */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Escala de Espaciado Tailwind
        </h3>
        <p className="text-muted-foreground">
          Los valores de espaciado más utilizados en el sistema Tailwind CSS.
        </p>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tailwindSpacing.map((space) => (
              <div key={space.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <code className="text-sm font-mono text-muted-foreground">
                    {space.name}
                  </code>
                  <span className="text-xs text-muted-foreground">
                    {space.value}
                  </span>
                </div>
                <div className="bg-muted h-2 relative rounded overflow-hidden">
                  <div
                    className="bg-primary h-full rounded"
                    style={{ width: space.value }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Padding Examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Ejemplos de Padding
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-2 bg-primary/10">
              <div className="bg-primary/20 rounded text-center text-sm py-2">
                p-2 (0.5rem)
              </div>
            </div>
            <div className="p-3 text-center text-xs text-muted-foreground">
              Padding pequeño
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 bg-primary/10">
              <div className="bg-primary/20 rounded text-center text-sm py-2">
                p-4 (1rem)
              </div>
            </div>
            <div className="p-3 text-center text-xs text-muted-foreground">
              Padding estándar
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-6 bg-primary/10">
              <div className="bg-primary/20 rounded text-center text-sm py-2">
                p-6 (1.5rem)
              </div>
            </div>
            <div className="p-3 text-center text-xs text-muted-foreground">
              Padding grande
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-primary/10">
              <div className="bg-primary/20 rounded text-center text-sm py-2">
                px-4 py-2
              </div>
            </div>
            <div className="p-3 text-center text-xs text-muted-foreground">
              Botón típico
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="px-6 py-3 bg-primary/10">
              <div className="bg-primary/20 rounded text-center text-sm py-2">
                px-6 py-3
              </div>
            </div>
            <div className="p-3 text-center text-xs text-muted-foreground">
              Botón grande
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-8 bg-primary/10">
              <div className="bg-primary/20 rounded text-center text-sm py-2">
                p-8 (2rem)
              </div>
            </div>
            <div className="p-3 text-center text-xs text-muted-foreground">
              Contenedor espacioso
            </div>
          </div>
        </div>
      </div>

      {/* Margin Examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Ejemplos de Margin
        </h3>
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="bg-muted/50 p-4 rounded">
            <div className="bg-primary/20 p-2 mb-2 rounded">
              <div className="bg-primary/40 p-2 rounded text-center text-sm">
                mb-2 (0.5rem)
              </div>
            </div>
            <div className="bg-primary/20 p-2 mb-4 rounded">
              <div className="bg-primary/40 p-2 rounded text-center text-sm">
                mb-4 (1rem)
              </div>
            </div>
            <div className="bg-primary/20 p-2 mb-6 rounded">
              <div className="bg-primary/40 p-2 rounded text-center text-sm">
                mb-6 (1.5rem)
              </div>
            </div>
            <div className="bg-primary/20 p-2 rounded">
              <div className="bg-primary/40 p-2 rounded text-center text-sm">
                Sin margin
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gap Examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Ejemplos de Gap (Flexbox/Grid)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h4 className="text-sm font-medium mb-4">Gap 2 (0.5rem)</h4>
            <div className="flex gap-2">
              <div className="bg-primary/20 p-3 rounded flex-1 text-center text-sm">1</div>
              <div className="bg-primary/20 p-3 rounded flex-1 text-center text-sm">2</div>
              <div className="bg-primary/20 p-3 rounded flex-1 text-center text-sm">3</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h4 className="text-sm font-medium mb-4">Gap 4 (1rem)</h4>
            <div className="flex gap-4">
              <div className="bg-secondary/20 p-3 rounded flex-1 text-center text-sm">1</div>
              <div className="bg-secondary/20 p-3 rounded flex-1 text-center text-sm">2</div>
              <div className="bg-secondary/20 p-3 rounded flex-1 text-center text-sm">3</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h4 className="text-sm font-medium mb-4">Gap 6 (1.5rem)</h4>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-accent p-3 rounded text-center text-sm">A</div>
              <div className="bg-accent p-3 rounded text-center text-sm">B</div>
              <div className="bg-accent p-3 rounded text-center text-sm">C</div>
              <div className="bg-accent p-3 rounded text-center text-sm">D</div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h4 className="text-sm font-medium mb-4">Gap 8 (2rem)</h4>
            <div className="flex flex-col gap-8">
              <div className="bg-muted p-4 rounded text-center text-sm">Item 1</div>
              <div className="bg-muted p-4 rounded text-center text-sm">Item 2</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}