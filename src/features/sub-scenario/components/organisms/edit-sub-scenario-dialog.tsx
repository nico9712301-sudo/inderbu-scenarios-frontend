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
import { SubScenario } from "@/services/api";
import { Button } from "@/shared/ui/button";
import { useEffect, useState } from "react";


interface Props {
  open: boolean;
  subScenario: SubScenario | null;
  onOpenChange(v: boolean): void;
}

export function EditSubScenarioDialog({
  open,
  subScenario,
  onOpenChange,
}: Props) {
  const { scenarios, activityAreas, fieldSurfaceTypes, updateSubScenario } =
    useSubScenarioData();
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (subScenario) setForm({ ...subScenario });
  }, [subScenario]);

  const save = async () => {
    if (!subScenario) return;
    await updateSubScenario(subScenario.id, form);
    onOpenChange(false);
  };

  console.log({subScenario});
  

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
