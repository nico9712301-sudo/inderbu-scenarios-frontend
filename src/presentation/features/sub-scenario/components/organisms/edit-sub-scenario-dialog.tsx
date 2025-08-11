"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { updateSubScenarioAction } from "@/presentation/features/dashboard/sub-scenarios/actions/sub-scenario.actions";
import { ActivityArea, FieldSurfaceType, Scenario, SubScenario } from "@/services/api";
import { SubScenarioForm } from "./sub-scenario-form";
import { Button } from "@/shared/ui/button";
import { useEffect, useState } from "react";


interface Props {
  open: boolean;
  subScenario: SubScenario | null;
  onOpenChange(v: boolean): void;
  handleSubScenarioCreatedOrUpdated(): void;
  scenarios: Scenario[];
  activityAreas: ActivityArea[];
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
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (subScenario) setForm({ ...subScenario });
  }, [subScenario]);

  const save = async () => {
    if (!subScenario) return;
    await updateSubScenarioAction(subScenario.id, form);
    handleSubScenarioCreatedOrUpdated
  };

  console.log({ subScenario });


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
