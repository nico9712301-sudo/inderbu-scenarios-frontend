"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { createScenarioAction } from "@/infrastructure/web/controllers/dashboard/scenario.actions";
import { IScenarioFormDataDTO, INeighborhoodOptionDTO } from "../../types/scenario.types";
import { ScenarioForm } from "../molecules/scenario-form.component";
import { ErrorHandlerResult } from "@/shared/api/error-handler";
import { Scenario } from "@/entities/scenario/domain/Scenario";
import { useScenarioForm } from "../../hooks/useScenarioForm";
import { Button } from "@/shared/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreateScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  neighborhoods: INeighborhoodOptionDTO[];
  onScenarioCreated: () => void;
}

export function CreateScenarioModal({
  isOpen,
  onClose,
  neighborhoods,
  onScenarioCreated,
}: CreateScenarioModalProps) {

  const form = useScenarioForm({
    onSubmit: async (formData: IScenarioFormDataDTO) => {
      try {
        const result: ErrorHandlerResult<Scenario> = await createScenarioAction({
          name: formData.name,
          address: formData.address,
          neighborhoodId: formData.neighborhoodId,
        });

        if (result.success) {
          // Build scenario object for UI callback
          const newScenario = {
            ...result.data,
            neighborhood: neighborhoods.find(n => n.id === formData.neighborhoodId),
          };

          form.reset();
          onScenarioCreated();
          onClose();

          toast.success("Escenario creado exitosamente", {
            description: `${result.data.name} ha sido registrado en el sistema.`,
          });
        } else {
          toast.error("Error al crear escenario", {
            description: result.error || "Ocurrió un error al crear el escenario.",
          });
        }
      } catch (error: any) {
        console.error('CLIENT: Unexpected error:', error);
        toast.error("Error al crear escenario", {
          description: "Ocurrió un error inesperado de conexión.",
        });
      }
    },
  });

  const handleSubmit = async () => {
    await form.handleSubmit();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[650px] max-h-[80vh] mx-auto bg-white overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl text-teal-700">
            Crear Escenario
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
          />
        </div>

        <DialogFooter className="flex justify-end gap-3 pt-3">
          <Button
            variant="outline"
            onClick={handleClose}
            size="sm"
            className="px-4"
            disabled={form.isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            className="bg-teal-600 hover:bg-teal-700 px-4"
            onClick={handleSubmit}
            size="sm"
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