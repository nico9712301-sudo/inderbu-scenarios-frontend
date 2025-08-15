"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { SubScenarioForm } from "./sub-scenario-form";
import { Button } from "@/shared/ui/button";
import { FieldSurfaceType, Scenario, SubScenario } from "@/shared/api/domain-types";
import { ActivityAreaPlainObject } from "@/entities/activity-area/domain/ActivityAreaEntity";
import { useSubScenarioForm } from "@/presentation/features/dashboard/sub-scenarios/hooks/use-sub-scenario-form-data.hook";
import { toast } from "sonner";


interface Props {
  open: boolean;
  onOpenChange(v: boolean): void;
  handleSubScenarioCreatedOrUpdated(): void;
  scenarios: Scenario[];
  activityAreas: ActivityAreaPlainObject[];
  fieldSurfaceTypes: FieldSurfaceType[];
}

export function CreateSubScenarioDialog({ open, onOpenChange, handleSubScenarioCreatedOrUpdated, scenarios, activityAreas, fieldSurfaceTypes }: Props) {

  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    updateScenario,
    updateActivityArea,
    updateFieldSurfaceType,
    updateImages,
    handleCreate,
    reset,
    hasError,
    getError
  } = useSubScenarioForm({
    onSuccess: (subScenario) => {
      toast.success("Sub-escenario creado exitosamente", {
        description: `${subScenario.name} ha sido creado correctamente.`,
      });
      handleSubScenarioCreatedOrUpdated();
      reset();
    },
    onError: (error) => {
      toast.error("Error al crear sub-escenario", {
        description: error,
      });
    }
  });

  const handleSave = async () => {
    await handleCreate();
  };

  console.log("Activity Areas from create-sub-scenario-dialog:", activityAreas);
  

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[650px] max-h-[80vh] mx-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-teal-700">
            Crear Sub-Escenario
          </DialogTitle>
          <DialogDescription>
            Completa la información y guarda.
          </DialogDescription>
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
            // Update each field individually through the form hook
            if (newValue.name !== formData.name) {
              updateField('name', newValue.name || '');
            }
            if (newValue.hasCost !== formData.hasCost) {
              updateField('hasCost', newValue.hasCost || false);
            }
            if (newValue.numberOfSpectators !== formData.numberOfSpectators) {
              updateField('numberOfSpectators', newValue.numberOfSpectators || 0);
            }
            if (newValue.numberOfPlayers !== formData.numberOfPlayers) {
              updateField('numberOfPlayers', newValue.numberOfPlayers || 0);
            }
            if (newValue.recommendations !== formData.recommendations) {
              updateField('recommendations', newValue.recommendations || '');
            }
            
            if (newValue.scenarioId && newValue.scenarioId !== parseInt(formData.scenario.id || '0')) {
              const scenario = scenarios.find(s => s.id === newValue.scenarioId);
              updateScenario(newValue.scenarioId.toString(), scenario?.name);
            }
            
            if (newValue.activityAreaId && newValue.activityAreaId !== parseInt(formData.activityArea.id || '0')) {
              const activityArea = activityAreas.find(a => a.id === newValue.activityAreaId);
              updateActivityArea(newValue.activityAreaId.toString(), activityArea?.name);
            }
            
            if (newValue.fieldSurfaceTypeId && newValue.fieldSurfaceTypeId !== parseInt(formData.fieldSurfaceType.id || '0')) {
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
