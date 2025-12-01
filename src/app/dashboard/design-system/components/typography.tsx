export function Typography() {
  return (
    <div className="space-y-8">
      {/* Headings */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Jerarquía de Títulos
        </h3>
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">
              Heading 1 - 4xl
            </h1>
            <code className="text-xs text-muted-foreground">
              text-4xl font-bold
            </code>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-semibold text-foreground">
              Heading 2 - 3xl
            </h2>
            <code className="text-xs text-muted-foreground">
              text-3xl font-semibold
            </code>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-foreground">
              Heading 3 - 2xl
            </h3>
            <code className="text-xs text-muted-foreground">
              text-2xl font-semibold
            </code>
          </div>

          <div className="space-y-2">
            <h4 className="text-xl font-medium text-foreground">
              Heading 4 - xl
            </h4>
            <code className="text-xs text-muted-foreground">
              text-xl font-medium
            </code>
          </div>

          <div className="space-y-2">
            <h5 className="text-lg font-medium text-foreground">
              Heading 5 - lg
            </h5>
            <code className="text-xs text-muted-foreground">
              text-lg font-medium
            </code>
          </div>

          <div className="space-y-2">
            <h6 className="text-base font-medium text-foreground">
              Heading 6 - base
            </h6>
            <code className="text-xs text-muted-foreground">
              text-base font-medium
            </code>
          </div>
        </div>
      </div>

      {/* Body Text */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Texto de Cuerpo
        </h3>
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div className="space-y-2">
            <p className="text-lg text-foreground">
              Texto grande - Ideal para introducciones y párrafos destacados.
            </p>
            <code className="text-xs text-muted-foreground">
              text-lg
            </code>
          </div>

          <div className="space-y-2">
            <p className="text-base text-foreground">
              Texto base - El tamaño estándar para la mayoría del contenido de la aplicación.
            </p>
            <code className="text-xs text-muted-foreground">
              text-base
            </code>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-foreground">
              Texto pequeño - Para información secundaria, etiquetas y metadatos.
            </p>
            <code className="text-xs text-muted-foreground">
              text-sm
            </code>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-foreground">
              Texto extra pequeño - Para notas al pie, códigos y texto auxiliar.
            </p>
            <code className="text-xs text-muted-foreground">
              text-xs
            </code>
          </div>
        </div>
      </div>

      {/* Text Colors */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Colores de Texto
        </h3>
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-foreground">
              Texto principal - Color primario del texto
            </p>
            <code className="text-xs text-muted-foreground">
              text-foreground
            </code>
          </div>

          <div className="space-y-2">
            <p className="text-muted-foreground">
              Texto silenciado - Para información secundaria
            </p>
            <code className="text-xs text-muted-foreground">
              text-muted-foreground
            </code>
          </div>

          <div className="space-y-2">
            <p className="text-primary">
              Texto primario - Color de marca INDERBU
            </p>
            <code className="text-xs text-muted-foreground">
              text-primary
            </code>
          </div>

          <div className="space-y-2">
            <p className="text-secondary">
              Texto secundario - Azul institucional
            </p>
            <code className="text-xs text-muted-foreground">
              text-secondary
            </code>
          </div>

          <div className="space-y-2">
            <p className="text-destructive">
              Texto destructivo - Para errores y alertas
            </p>
            <code className="text-xs text-muted-foreground">
              text-destructive
            </code>
          </div>
        </div>
      </div>

      {/* Font Weights */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Pesos de Fuente
        </h3>
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <p className="font-light text-foreground">
              Font Light - Para textos extensos y citas
            </p>
            <code className="text-xs text-muted-foreground">
              font-light
            </code>
          </div>

          <div className="space-y-2">
            <p className="font-normal text-foreground">
              Font Normal - El peso estándar para texto
            </p>
            <code className="text-xs text-muted-foreground">
              font-normal
            </code>
          </div>

          <div className="space-y-2">
            <p className="font-medium text-foreground">
              Font Medium - Para énfasis suave
            </p>
            <code className="text-xs text-muted-foreground">
              font-medium
            </code>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-foreground">
              Font Semibold - Para subtítulos importantes
            </p>
            <code className="text-xs text-muted-foreground">
              font-semibold
            </code>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-foreground">
              Font Bold - Para títulos y elementos destacados
            </p>
            <code className="text-xs text-muted-foreground">
              font-bold
            </code>
          </div>
        </div>
      </div>

      {/* Special Text Effects */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Efectos Especiales
        </h3>
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-gradient text-xl font-bold">
              Texto con Gradiente
            </p>
            <code className="text-xs text-muted-foreground">
              text-gradient (clase personalizada)
            </code>
          </div>

          <div className="space-y-2">
            <code className="bg-muted text-muted-foreground px-2 py-1 rounded text-sm font-mono">
              Texto de código
            </code>
            <br />
            <code className="text-xs text-muted-foreground">
              bg-muted text-muted-foreground px-2 py-1 rounded font-mono
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}