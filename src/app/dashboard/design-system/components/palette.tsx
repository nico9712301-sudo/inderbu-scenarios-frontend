"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface ColorShowcaseProps {
  name: string;
  value: string;
  description?: string;
  textColor?: string;
}

function ColorShowcase({ name, value, description, textColor = "text-foreground" }: ColorShowcaseProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="relative group cursor-pointer rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all"
      onClick={handleCopy}
      style={{ backgroundColor: `hsl(${value})` }}
    >
      <div className="p-4 min-h-[120px] flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`font-semibold text-sm ${textColor}`}>
              --{name}
            </h3>
            <p className={`text-xs opacity-90 mt-1 ${textColor}`}>
              hsl({value})
            </p>
            {description && (
              <p className={`text-xs opacity-75 mt-2 ${textColor}`}>
                {description}
              </p>
            )}
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            {copied ? (
              <Check className={`w-4 h-4 ${textColor}`} />
            ) : (
              <Copy className={`w-4 h-4 ${textColor}`} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Palette() {
  const colors = [
    // Primary Colors - INDERBU Brand
    {
      name: "primary",
      value: "103, 100%, 36%",
      description: "Verde INDERBU principal",
      textColor: "text-primary-foreground"
    },
    {
      name: "primary-foreground",
      value: "0 0% 100%",
      description: "Texto sobre verde principal",
      textColor: "text-foreground"
    },

    // Primary Scale
    {
      name: "primary-50",
      value: "103, 100%, 96%",
      description: "Verde muy claro para fondos",
      textColor: "text-foreground"
    },
    {
      name: "primary-100",
      value: "103, 100%, 90%",
      description: "Verde claro para hover suave",
      textColor: "text-foreground"
    },
    {
      name: "primary-200",
      value: "103, 100%, 80%",
      description: "Verde claro para bordes",
      textColor: "text-foreground"
    },
    {
      name: "primary-300",
      value: "103, 100%, 70%",
      description: "Verde medio claro",
      textColor: "text-foreground"
    },
    {
      name: "primary-400",
      value: "103, 100%, 50%",
      description: "Verde medio",
      textColor: "text-primary-foreground"
    },
    {
      name: "primary-500",
      value: "103, 100%, 40%",
      description: "Verde",
      textColor: "text-primary-foreground"
    },
    {
      name: "primary-600",
      value: "103, 100%, 36%",
      description: "Verde INDERBU principal",
      textColor: "text-primary-foreground"
    },
    {
      name: "primary-700",
      value: "103, 100%, 30%",
      description: "Verde oscuro para hover",
      textColor: "text-primary-foreground"
    },
    {
      name: "primary-800",
      value: "103, 100%, 25%",
      description: "Verde muy oscuro",
      textColor: "text-primary-foreground"
    },
    {
      name: "primary-900",
      value: "103, 100%, 20%",
      description: "Verde extremadamente oscuro",
      textColor: "text-primary-foreground"
    },

    // Secondary Colors - Azul Institucional
    {
      name: "secondary",
      value: "217, 91%, 60%",
      description: "Azul institucional gobierno",
      textColor: "text-secondary-foreground"
    },
    {
      name: "secondary-foreground",
      value: "0 0% 100%",
      description: "Texto sobre azul institucional",
      textColor: "text-foreground"
    },
    {
      name: "secondary-50",
      value: "217, 91%, 96%",
      description: "Azul muy claro",
      textColor: "text-foreground"
    },
    {
      name: "secondary-100",
      value: "217, 91%, 90%",
      description: "Azul claro",
      textColor: "text-foreground"
    },
    {
      name: "secondary-200",
      value: "217, 91%, 80%",
      description: "Azul medio claro",
      textColor: "text-foreground"
    },
    {
      name: "secondary-600",
      value: "217, 91%, 60%",
      description: "Azul institucional",
      textColor: "text-secondary-foreground"
    },
    {
      name: "secondary-700",
      value: "217, 91%, 50%",
      description: "Azul oscuro",
      textColor: "text-secondary-foreground"
    },

    // System Colors
    {
      name: "background",
      value: "0 0% 100%",
      description: "Fondo principal",
      textColor: "text-foreground"
    },
    {
      name: "foreground",
      value: "222.2 84% 4.9%",
      description: "Texto principal",
      textColor: "text-background"
    },
    {
      name: "card",
      value: "0 0% 100%",
      description: "Fondo de tarjetas",
      textColor: "text-card-foreground"
    },
    {
      name: "card-foreground",
      value: "222.2 84% 4.9%",
      description: "Texto en tarjetas",
      textColor: "text-card"
    },
    {
      name: "popover",
      value: "0 0% 100%",
      description: "Fondo de popovers",
      textColor: "text-popover-foreground"
    },
    {
      name: "popover-foreground",
      value: "222.2 84% 4.9%",
      description: "Texto en popovers",
      textColor: "text-popover"
    },
    {
      name: "muted",
      value: "210 40% 96.1%",
      description: "Elementos silenciados",
      textColor: "text-muted-foreground"
    },
    {
      name: "muted-foreground",
      value: "215.4 16.3% 46.9%",
      description: "Texto silenciado",
      textColor: "text-muted"
    },
    {
      name: "accent",
      value: "210 40% 96.1%",
      description: "Color de acento",
      textColor: "text-accent-foreground"
    },
    {
      name: "accent-foreground",
      value: "222.2 47.4% 11.2%",
      description: "Texto sobre acento",
      textColor: "text-accent"
    },
    {
      name: "destructive",
      value: "0 84.2% 60.2%",
      description: "Acciones destructivas",
      textColor: "text-destructive-foreground"
    },
    {
      name: "destructive-foreground",
      value: "210 40% 98%",
      description: "Texto sobre destructivo",
      textColor: "text-destructive"
    },
    {
      name: "border",
      value: "214.3 31.8% 91.4%",
      description: "Bordes",
      textColor: "text-foreground"
    },
    {
      name: "input",
      value: "214.3 31.8% 91.4%",
      description: "Fondo de inputs",
      textColor: "text-foreground"
    },
    {
      name: "ring",
      value: "246 80% 60%",
      description: "Anillos de focus",
      textColor: "text-background"
    },
    {
      name: "complementary",
      value: "291 91% 83%",
      description: "Color complementario",
      textColor: "text-foreground"
    }
  ];

  return (
    <div className="space-y-8">
      {/* INDERBU Brand Colors */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Colores Principales INDERBU
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {colors.slice(0, 2).map((color) => (
            <ColorShowcase key={color.name} {...color} />
          ))}
        </div>
      </div>

      {/* Primary Scale */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Escala Verde Primary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {colors.slice(2, 12).map((color) => (
            <ColorShowcase key={color.name} {...color} />
          ))}
        </div>
      </div>

      {/* Secondary Scale */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Escala Azul Secondary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {colors.slice(12, 19).map((color) => (
            <ColorShowcase key={color.name} {...color} />
          ))}
        </div>
      </div>

      {/* System Colors */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Colores del Sistema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {colors.slice(19).map((color) => (
            <ColorShowcase key={color.name} {...color} />
          ))}
        </div>
      </div>

      {/* Usage Examples */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">
          Ejemplos de Uso
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Primary Button Example */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h4 className="font-medium text-card-foreground">Botón Primary</h4>
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
              Botón Principal
            </button>
            <code className="text-xs text-muted-foreground block">
              bg-primary text-primary-foreground
            </code>
          </div>

          {/* Secondary Button Example */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h4 className="font-medium text-card-foreground">Botón Secondary</h4>
            <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/90 transition-colors">
              Botón Secundario
            </button>
            <code className="text-xs text-muted-foreground block">
              bg-secondary text-secondary-foreground
            </code>
          </div>

          {/* Destructive Button Example */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h4 className="font-medium text-card-foreground">Botón Destructivo</h4>
            <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 transition-colors">
              Eliminar
            </button>
            <code className="text-xs text-muted-foreground block">
              bg-destructive text-destructive-foreground
            </code>
          </div>

          {/* Muted Example */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h4 className="font-medium text-card-foreground">Elementos Muted</h4>
            <div className="bg-muted px-4 py-2 rounded-lg">
              <p className="text-muted-foreground">Texto silenciado</p>
            </div>
            <code className="text-xs text-muted-foreground block">
              bg-muted text-muted-foreground
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}