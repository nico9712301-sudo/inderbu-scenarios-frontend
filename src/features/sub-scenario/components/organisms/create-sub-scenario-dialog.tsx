"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { useSubScenarioData } from "../../hooks/use-sub-scenario-data";
import { SubScenarioForm } from "./sub-scenario-form";
import { Button } from "@/shared/ui/button";
import { useState } from "react";
import { SubScenario } from "@/services/api";
import { useRouter } from "next/navigation";


interface Props {
  open: boolean;
  onOpenChange(v: boolean): void;
  handleSubScenarioCreatedOrUpdated(): void;
}

export function CreateSubScenarioDialog({ open, onOpenChange, handleSubScenarioCreatedOrUpdated }: Props) {
  const { scenarios, activityAreas, fieldSurfaceTypes, createSubScenario } =
    useSubScenarioData();
  const [form, setForm] = useState<Omit<SubScenario, "id">>({
    name: "",
    active: true,
    hasCost: false,
    numberOfSpectators: 0,
    numberOfPlayers: 0,
    recommendations: "",
    scenarioId: undefined,
    activityAreaId: undefined,
    fieldSurfaceTypeId: undefined,
    images: [],
  });

  const save = async () => {
    console.log("Saving sub-scenario with data:", form);
    await createSubScenario(form);
    handleSubScenarioCreatedOrUpdated();
  };

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
          value={form}
          onChange={setForm}
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
            onClick={save}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
