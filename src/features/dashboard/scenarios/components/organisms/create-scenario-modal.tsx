"use client";

import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";

import { ScenarioForm } from "../molecules/scenario-form";
import { useScenarioForm } from "../../hooks/use-scenario-form";
import { ScenarioCommandFactory } from "../../commands/scenario-commands";

interface NeighborhoodOption {
  id: number;
  name: string;
}

interface CreateScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  neighborhoods: NeighborhoodOption[];
  onScenarioCreated: (scenario: any) => void;
}

export function CreateScenarioModal({
  isOpen,
  onClose,
  neighborhoods,
  onScenarioCreated,
}: CreateScenarioModalProps) {
  const form = useScenarioForm({
    onSubmit: async (formData) => {
      const command = ScenarioCommandFactory.createScenario(formData, neighborhoods, {
        onSuccess: (newScenario) => {
          onScenarioCreated(newScenario);
          form.reset();
          onClose();
        },
        onError: (error) => {
          console.error('Create scenario error:', error);
        }
      });

      await command.execute();
      return Promise.resolve();
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