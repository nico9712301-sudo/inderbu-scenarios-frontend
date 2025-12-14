"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { GripVertical, X, Settings } from "lucide-react";
import { cn } from "@/shared/utils/utils";
import type { TemplateComponentConfig } from "../types/template-builder.types";
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

interface TemplateComponentProps {
  component: TemplateComponentConfig;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onSettings: () => void;
}

const componentIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  logo: Image,
  title: Type,
  "client-data": User,
  "concepts-table": Table,
  "hourly-cost": Clock,
  total: DollarSign,
  "bank-data": Building2,
  "payment-qr": QrCode,
  "free-text": FileText,
  date: Calendar,
};

const componentLabelMap: Record<string, string> = {
  logo: "Logo",
  title: "Título",
  "client-data": "Datos del Cliente",
  "concepts-table": "Tabla de Conceptos",
  "hourly-cost": "Costo por Hora",
  total: "Total",
  "bank-data": "Datos Bancarios",
  "payment-qr": "QR de Pago",
  "free-text": "Texto Libre",
  date: "Fecha",
};

export function TemplateComponent({
  component,
  isSelected,
  onSelect,
  onRemove,
  onSettings,
}: TemplateComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = componentIconMap[component.type] || FileText;
  const label = componentLabelMap[component.type] || component.type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isDragging && "opacity-50",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      <Card
        className={cn(
          "cursor-pointer hover:bg-accent transition-colors",
          isSelected && "bg-accent"
        )}
        onClick={onSelect}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <Icon className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">{label}</p>
              {component.props?.text && (
                <p className="text-xs text-muted-foreground truncate">
                  {component.props.text}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  onSettings();
                }}
              >
                <Settings className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
