"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent } from "@/shared/ui/card";
import { cn } from "@/shared/utils/utils";
import type { TemplateComponentConfig } from "../types/template-builder.types";
import { TemplateComponent } from "./template-component";

interface TemplateCanvasProps {
  components: TemplateComponentConfig[];
  selectedComponentId: string | null;
  onComponentSelect: (id: string) => void;
  onComponentRemove: (id: string) => void;
  onComponentSettings: (id: string) => void;
}

export function TemplateCanvas({
  components,
  selectedComponentId,
  onComponentSelect,
  onComponentRemove,
  onComponentSettings,
}: TemplateCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "template-canvas",
  });

  return (
    <div className="flex-1 p-6 relative z-0 flex flex-col h-full overflow-y-scroll">
      <div className="mb-4 flex-shrink-0">
        <h3 className="text-sm font-semibold">Área de Diseño</h3>
        <p className="text-xs text-muted-foreground">
          Arrastra componentes aquí o haz clic en ellos para agregarlos
        </p>
      </div>

      <Card
        ref={setNodeRef}
        className={cn(
          "flex-1 bg-background relative z-0 flex flex-col overflow-y-scroll min-h-0",
          isOver && "ring-2 ring-primary ring-offset-2"
        )}
      >
        <CardContent className="p-6 flex-1 flex flex-col overflow-hidden min-h-0">
          {components.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 w-full">
                <p className="text-sm text-muted-foreground">
                  Arrastra componentes desde el panel lateral o haz clic en ellos para agregarlos
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-scroll min-h-0">
              <SortableContext
                items={components.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3 pr-4">
                  {components.map((component) => (
                    <TemplateComponent
                      key={component.id}
                      component={component}
                      isSelected={selectedComponentId === component.id}
                      onSelect={() => onComponentSelect(component.id)}
                      onRemove={() => onComponentRemove(component.id)}
                      onSettings={() => onComponentSettings(component.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
