"use client";

import { useDraggable } from "@dnd-kit/core";
import { AVAILABLE_COMPONENTS, type ComponentDefinition } from "../types/template-builder.types";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Image,
  Type,
  User,
  Table,
  Clock,
  DollarSign,
  Building2,
  QrCode,
  FileText,
  Calendar,
} from "lucide-react";
import { cn } from "@/shared/utils/utils";

interface ComponentPaletteProps {
  onComponentSelect: (type: ComponentDefinition["type"]) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Image,
  Type,
  User,
  Table,
  Clock,
  DollarSign,
  Building2,
  QrCode,
  FileText,
  Calendar,
};

function DraggableComponentItem({ component, onSelect }: { component: ComponentDefinition; onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette-${component.type}`,
    data: {
      type: "palette-component",
      componentType: component.type,
    },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const Icon = iconMap[component.icon] || FileText;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-move hover:bg-accent transition-colors",
        "border-2 border-dashed border-border",
        isDragging && "opacity-50"
      )}
      {...listeners}
      {...attributes}
      onClick={onSelect}
    >
      <CardContent className="p-3 flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{component.label}</p>
          <p className="text-xs text-muted-foreground truncate">
            {component.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ComponentPalette({ onComponentSelect }: ComponentPaletteProps) {
  return (
    <div className="w-full border-r bg-muted/30 flex flex-col h-full overflow-y-scroll">
      <div className="p-4 border-b flex-shrink-0">
        <h3 className="text-sm font-semibold mb-2">Componentes Disponibles</h3>
        <p className="text-xs text-muted-foreground">
          Arrastra o haz clic para agregar
        </p>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 space-y-2">
          {AVAILABLE_COMPONENTS.map((component) => (
            <DraggableComponentItem
              key={component.type}
              component={component}
              onSelect={() => onComponentSelect(component.type)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
