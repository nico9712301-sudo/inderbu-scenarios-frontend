"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type { TemplateComponentConfig } from "../types/template-builder.types";

interface ComponentSettingsProps {
  component: TemplateComponentConfig | null;
  onUpdate: (updates: Partial<TemplateComponentConfig>) => void;
}

export function ComponentSettings({ component, onUpdate }: ComponentSettingsProps) {
  if (!component) {
    return (
      <div className="w-80 border-l bg-muted/30 p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground text-center">
              Selecciona un componente para editar sus propiedades
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-80 border-l bg-muted/30 p-4 overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuración</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Common settings */}
          <div className="space-y-2">
            <Label>ID del Componente</Label>
            <Input value={component.id} disabled className="font-mono text-xs" />
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Input value={component.type} disabled className="font-mono text-xs" />
          </div>

          {/* Component-specific settings */}
          {component.type === "title" && (
            <div className="space-y-2">
              <Label>Texto del Título</Label>
              <Input
                value={component.props?.text || ""}
                onChange={(e) =>
                  onUpdate({
                    props: {
                      ...component.props,
                      text: e.target.value,
                    },
                  })
                }
                placeholder="Ej: RECIBO DE PAGO"
              />
            </div>
          )}

          {component.type === "free-text" && (
            <div className="space-y-2">
              <Label>Texto Libre</Label>
              <Textarea
                value={component.props?.text || ""}
                onChange={(e) =>
                  onUpdate({
                    props: {
                      ...component.props,
                      text: e.target.value,
                    },
                  })
                }
                placeholder="Ingrese el texto libre..."
                rows={4}
              />
            </div>
          )}

          {/* Position settings */}
          <div className="space-y-2">
            <Label>Posición</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">X</Label>
                <Input
                  type="number"
                  value={component.position.x}
                  onChange={(e) =>
                    onUpdate({
                      position: {
                        ...component.position,
                        x: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">Y</Label>
                <Input
                  type="number"
                  value={component.position.y}
                  onChange={(e) =>
                    onUpdate({
                      position: {
                        ...component.position,
                        y: Number(e.target.value),
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Size settings (if applicable) */}
          {component.size && (
            <div className="space-y-2">
              <Label>Tamaño</Label>
              <div className="grid grid-cols-2 gap-2">
                {component.size.width !== undefined && (
                  <div>
                    <Label className="text-xs">Ancho</Label>
                    <Input
                      type="number"
                      value={component.size.width}
                      onChange={(e) =>
                        onUpdate({
                          size: {
                            ...component.size,
                            width: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                )}
                {component.size.height !== undefined && (
                  <div>
                    <Label className="text-xs">Alto</Label>
                    <Input
                      type="number"
                      value={component.size.height}
                      onChange={(e) =>
                        onUpdate({
                          size: {
                            ...component.size,
                            height: Number(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
