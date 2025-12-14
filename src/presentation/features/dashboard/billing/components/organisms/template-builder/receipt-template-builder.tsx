"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent } from "@/shared/ui/card";
import { 
  Loader2,
  Image,
  Type as TypeIcon,
  User,
  Table,
  Clock,
  DollarSign,
  Building2,
  QrCode,
  FileText,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
// arrayMove not needed, using custom reorder logic
import { ComponentPalette } from "./components/component-palette";
import { TemplateCanvas } from "./components/template-canvas";
import { useTemplateBuilder } from "./hooks/use-template-builder.hook";
import type { TemplateContent, TemplateComponentType, ComponentDefinition } from "./types/template-builder.types";
import { AVAILABLE_COMPONENTS } from "./types/template-builder.types";
import type { TemplatePlainObject } from "@/entities/billing/domain/TemplateEntity";
import { createTemplateAction, updateTemplateAction } from "@/infrastructure/web/controllers/dashboard/template.actions";

// Component preview for DragOverlay
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Image,
  Type: TypeIcon,
  User,
  Table,
  Clock,
  DollarSign,
  Building2,
  QrCode,
  FileText,
  Calendar,
};

function ComponentDragPreview({ componentType }: { componentType: TemplateComponentType }) {
  const component = AVAILABLE_COMPONENTS.find(c => c.type === componentType);
  if (!component) return null;

  const Icon = iconMap[component.icon] || FileText;

  return (
    <Card className="w-64 border-2 border-dashed border-primary shadow-lg opacity-95">
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

interface ReceiptTemplateBuilderProps {
  open: boolean;
  onClose: () => void;
  template?: TemplatePlainObject | null; // For editing existing template
  onSuccess?: () => void;
}

export function ReceiptTemplateBuilder({
  open,
  onClose,
  template,
  onSuccess,
}: ReceiptTemplateBuilderProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Initialize template builder
  const initialContent: TemplateContent | undefined = template?.content
    ? JSON.parse(template.content)
    : undefined;

  const {
    components,
    selectedComponentId,
    setSelectedComponentId,
    addComponent,
    removeComponent,
    updateComponent,
    reorderComponents,
    getTemplateContent,
    loadTemplateContent,
  } = useTemplateBuilder(initialContent);

  // Load template data when editing
  useEffect(() => {
    if (open && template) {
      setName(template.name);
      setDescription(template.description || "");
      if (template.content) {
        try {
          const content = JSON.parse(template.content);
          loadTemplateContent(content);
        } catch (error) {
          console.error("Error parsing template content:", error);
        }
      }
    } else if (open && !template) {
      // Reset for new template
      setName("");
      setDescription("");
      loadTemplateContent({ components: [] });
    }
  }, [open, template, loadTemplateContent]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Allow dropping from palette
    if (event.active.data.current?.type === "palette-component") {
      // Visual feedback handled by useDroppable
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) {
      console.log("Drag ended without over target");
      return;
    }

    console.log("Drag end:", { activeId: active.id, overId: over.id, activeData: active.data.current });

    // Handle dropping component from palette to canvas
    if (active.data.current?.type === "palette-component") {
      // Check if dropped on canvas or on a component in canvas
      if (over.id === "template-canvas" || components.some(c => c.id === over.id)) {
        const componentType = active.data.current.componentType as TemplateComponentType;
        console.log("Adding component:", componentType);
        addComponent(componentType);
      } else {
        console.log("Drop target not valid:", over.id);
      }
      return;
    }

    // Handle reordering components in canvas
    if (active.id !== over.id && typeof active.id === "string" && typeof over.id === "string") {
      // Only reorder if both are component IDs (not palette items)
      if (!active.id.startsWith("palette-") && !over.id.startsWith("palette-")) {
        console.log("Reordering components:", { activeId: active.id, overId: over.id });
        reorderComponents(active.id, over.id);
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("El nombre es requerido", {
        description: "Por favor ingrese un nombre para la plantilla.",
      });
      return;
    }

    if (components.length === 0) {
      toast.error("La plantilla está vacía", {
        description: "Agregue al menos un componente a la plantilla.",
      });
      return;
    }

    setSaving(true);
    try {
      const content = getTemplateContent();
      const contentJson = JSON.stringify(content);

      console.log("Saving template:", { name, description, componentsCount: components.length, contentJson });

      let result;
      if (template) {
        // Update existing template
        console.log("Updating template:", template.id);
        result = await updateTemplateAction(template.id, {
          name,
          description: description || undefined,
          content: contentJson,
        });
      } else {
        // Create new template
        console.log("Creating new template");
        result = await createTemplateAction({
          name,
          type: "receipt",
          content: contentJson,
          description: description || undefined,
          active: true,
        });
      }

      console.log("Template action result:", result);

      if (result.success) {
        toast.success(
          template ? "Plantilla actualizada" : "Plantilla creada",
          {
            description: `La plantilla "${name}" ha sido ${
              template ? "actualizada" : "creada"
            } exitosamente.`,
          }
        );
        onSuccess?.();
        onClose();
      } else {
        console.error("Template action failed:", result);
        toast.error(
          template ? "Error al actualizar plantilla" : "Error al crear plantilla",
          {
            description: result.error || "Ocurrió un error inesperado.",
          }
        );
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error(
        template ? "Error al actualizar plantilla" : "Error al crear plantilla",
        {
          description: "Ocurrió un error inesperado. Intente de nuevo.",
        }
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[1200px] max-h-[90vh] w-full flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {template ? "Editar Plantilla" : "Crear Nueva Plantilla"}
          </DialogTitle>
          <DialogDescription>
            Diseña tu plantilla de recibo arrastrando componentes al área de diseño
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-4 h-0">
          {/* DndContext must wrap both palette and canvas for drag-and-drop to work */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
          >
            {/* Left: Component Palette */}
            <div className="w-2/5 flex flex-col h-full overflow-hidden">
              <ComponentPalette onComponentSelect={addComponent} />
            </div>

            {/* Center: Canvas */}
            <div className="w-3/5 flex flex-col h-full overflow-hidden">
              <TemplateCanvas
              components={components}
              selectedComponentId={selectedComponentId}
              onComponentSelect={setSelectedComponentId}
              onComponentRemove={removeComponent}
              onComponentSettings={() => {
                // Settings panel is always visible, just ensure component is selected
              }}
            />
            </div>

            {/* DragOverlay shows dragged item above everything with high z-index */}
            <DragOverlay style={{ zIndex: 9999 }}>
              {activeId ? (
                activeId.startsWith("palette-") ? (
                  <ComponentDragPreview componentType={activeId.replace("palette-", "") as TemplateComponentType} />
                ) : (
                  <ComponentDragPreview 
                    componentType={components.find(c => c.id === activeId)?.type || "title"} 
                  />
                )
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Template Info Form */}
        <div className="border-t pt-4 space-y-4 flex-shrink-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">
                Nombre de la Plantilla <span className="text-destructive">*</span>
              </Label>
              <Input
                id="template-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Plantilla Básica de Recibo"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-description">Descripción (opcional)</Label>
              <Input
                id="template-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción de la plantilla"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim() || components.length === 0}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              template ? "Actualizar Plantilla" : "Crear Plantilla"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
