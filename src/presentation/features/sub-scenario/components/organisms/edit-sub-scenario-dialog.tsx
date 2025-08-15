"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { FieldSurfaceType, Scenario, SubScenario } from "@/shared/api/domain-types";
import { ActivityAreaPlainObject } from "@/entities/activity-area/domain/ActivityAreaEntity";
import { SubScenarioForm } from "./sub-scenario-form";
import { Button } from "@/shared/ui/button";
import { useEffect } from "react";
import { useSubScenarioForm } from "@/presentation/features/dashboard/sub-scenarios/hooks/use-sub-scenario-form-data.hook";
import { toast } from "sonner";


interface Props {
  open: boolean;
  subScenario: SubScenario | null;
  onOpenChange(v: boolean): void;
  handleSubScenarioCreatedOrUpdated(): void;
  scenarios: Scenario[];
  activityAreas: ActivityAreaPlainObject[];
  fieldSurfaceTypes: FieldSurfaceType[];
}

export function EditSubScenarioDialog({
  open,
  subScenario,
  onOpenChange,
  handleSubScenarioCreatedOrUpdated,
  scenarios,
  activityAreas,
  fieldSurfaceTypes,
}: Props) {
  
  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    updateScenario,
    updateActivityArea,
    updateFieldSurfaceType,
    updateImages,
    handleUpdate,
    loadSubScenario,
    hasError,
    getError
  } = useSubScenarioForm({
    onSuccess: (subScenario) => {
      toast.success("Sub-escenario actualizado exitosamente", {
        description: `${subScenario.name} ha sido actualizado correctamente.`,
      });
      handleSubScenarioCreatedOrUpdated();
    },
    onError: (error) => {
      toast.error("Error al actualizar sub-escenario", {
        description: error,
      });
    }
  });

  // Load sub-scenario data when dialog opens
  useEffect(() => {
    if (subScenario && open) {
      loadSubScenario(subScenario);
    }
  }, [subScenario, open, loadSubScenario]);

  const handleSave = async () => {
    if (!subScenario) return;
    await handleUpdate(subScenario.id);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[650px] max-h-[80vh] mx-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-teal-700">
            Editar: {subScenario?.name}
          </DialogTitle>
          <DialogDescription>Modifica y guarda los cambios</DialogDescription>
        </DialogHeader>

        <SubScenarioForm
          value={{
            name: formData.name,
            hasCost: formData.hasCost,
            numberOfSpectators: formData.numberOfSpectators,
            numberOfPlayers: formData.numberOfPlayers,
            recommendations: formData.recommendations,
            scenarioId: formData.scenario.id ? parseInt(formData.scenario.id) : undefined,
            activityAreaId: formData.activityArea.id ? parseInt(formData.activityArea.id) : undefined,
            fieldSurfaceTypeId: formData.fieldSurfaceType.id ? parseInt(formData.fieldSurfaceType.id) : undefined,
          }}
          onChange={(newValue) => {
            // Transform the flat structure back to the hook structure
            updateField('name', newValue.name || '');
            updateField('hasCost', newValue.hasCost || false);
            updateField('numberOfSpectators', newValue.numberOfSpectators || 0);
            updateField('numberOfPlayers', newValue.numberOfPlayers || 0);
            updateField('recommendations', newValue.recommendations || '');
            
            if (newValue.scenarioId) {
              const scenario = scenarios.find(s => s.id === newValue.scenarioId);
              updateScenario(newValue.scenarioId.toString(), scenario?.name);
            }
            
            if (newValue.activityAreaId) {
              const activityArea = activityAreas.find(a => a.id === newValue.activityAreaId);
              updateActivityArea(newValue.activityAreaId.toString(), activityArea?.name);
            }
            
            if (newValue.fieldSurfaceTypeId) {
              const fieldSurfaceType = fieldSurfaceTypes.find(f => f.id === newValue.fieldSurfaceTypeId);
              updateFieldSurfaceType(newValue.fieldSurfaceTypeId.toString(), fieldSurfaceType?.name);
            }
          }}
          onImagesChange={updateImages}
          images={formData.images}
          scenarios={scenarios}
          activityAreas={activityAreas}
          fieldSurfaceTypes={fieldSurfaceTypes}
          showImages
        />

        <DialogFooter className="pt-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            size="sm"
          >
            Cancelar
          </Button>
          <Button
            className="bg-teal-600 hover:bg-teal-700"
            size="sm"
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
