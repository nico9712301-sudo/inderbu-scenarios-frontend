"use client";

import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Scenario } from "@/shared/api/domain-types";
import { useScenarioForm } from "../../hooks/useScenarioForm";
import { updateScenarioAction } from "@/infrastructure/web/controllers/dashboard/scenario.actions";
import { ScenarioForm } from "../molecules/scenario-form.component";
import { IScenarioFormDataDTO, INeighborhoodOptionDTO } from "../../types/scenario.types";
import { ErrorHandlerResult } from "@/shared/api/error-handler";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: Scenario | null;
  neighborhoods: INeighborhoodOptionDTO[];
  onScenarioUpdated: () => void;
}

export function EditScenarioModal({
  isOpen,
  onClose,
  scenario,
  neighborhoods,
  onScenarioUpdated,
}: IProps) {

  console.log({ scenarioToEdit: scenario });

  const form = useScenarioForm({
    onSubmit: async (formData: IScenarioFormDataDTO) => {
      if (!scenario) return;
      
      try {

        const result = await updateScenarioAction(scenario.id, {
          name: formData.name,
          address: formData.address,
          neighborhoodId: formData.neighborhoodId,
          active: formData.active,
        });

        if (result.success) {
          onScenarioUpdated();
          onClose();
          
          toast.success("Escenario actualizado exitosamente", {
            description: `${result.data.name} ha sido actualizado.`,
          });
        } else {
          toast.error("Error al actualizar escenario", {
            description: result.error || "Ocurrió un error al actualizar el escenario.",
          });
        }
      } catch (error) {
        console.error("CLIENT: Unexpected update error:", error);
        toast.error("Error al actualizar escenario", {
          description: "Ocurrió un error inesperado de conexión.",
        });
      }

      return Promise.resolve();
    },
  });

  // Load scenario data when modal opens or scenario changes
  useEffect(() => {
    if (scenario && isOpen) {
      form.loadScenario(scenario);
    }
  }, [scenario, isOpen]);

  const handleSubmit = async () => {
    await form.handleSubmit();
  };

  if (!scenario) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[650px] max-h-[80vh] mx-auto bg-white overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl text-teal-700">
            Editar Escenario: {scenario.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-180px)]">
          <ScenarioForm
            formData={form.formData}
            errors={form.errors}
            neighborhoods={neighborhoods}
            onFieldChange={form.updateField}
            onNeighborhoodChange={form.updateNeighborhood}
            onErrorClear={(field) => {
              // Clear individual errors if needed
            }}
            selectedScenario={scenario}
          />
        </div>

        <DialogFooter className="flex justify-end gap-3 pt-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-4"
            size="sm"
            disabled={form.isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            className="bg-teal-600 hover:bg-teal-700 px-4"
            size="sm"
            onClick={handleSubmit}
            disabled={form.isSubmitting}
          >
            {form.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}