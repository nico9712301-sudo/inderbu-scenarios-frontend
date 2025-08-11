"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { FilterState } from "../../hooks/use-sub-scenario-data";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Filter } from "lucide-react";


interface Props {
  visible: boolean;
  filters: FilterState;
  scenarios: { id: number; name: string }[];
  activityAreas: { id: number; name: string }[];
  neighborhoods: { id: number; name: string }[];
  onChange(filters: FilterState): void;
  onToggle(): void;
}

export function FilterPanel({
  visible,
  filters,
  scenarios,
  activityAreas,
  neighborhoods,
  onChange,
  onToggle,
}: Props) {
  const local = { ...filters };

  const set = <K extends keyof FilterState>(k: K, v: FilterState[K]) => {
    local[k] = v;
    onChange({ ...local } as FilterState);
  };

  if (!visible) return null;

  return (
    <div className="mb-4 animate-in fade-in">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-1">
            <Filter className="h-4 w-4" /> Filtros de búsqueda
          </CardTitle>
          <CardDescription>
            Refina los resultados usando los siguientes filtros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* text search */}
            <div className="space-y-2">
              <Label>Nombre / Código</Label>
              <Input
                placeholder="Buscar…"
                value={local.search}
                onChange={(e) => set("search", e.target.value)}
              />
            </div>

            {/* selects */}
            {[
              { id: "scenarioId", label: "Escenario", data: scenarios },
              {
                id: "activityAreaId",
                label: "Área Actividad",
                data: activityAreas,
              },
              { id: "neighborhoodId", label: "Barrio", data: neighborhoods },
            ].map((opt) => (
              <div key={opt.id} className="space-y-2">
                <Label>{opt.label}</Label>
                <select
                  className="flex h-10 w-full rounded-md border px-3 py-2 text-sm"
                  value={local[opt.id as keyof FilterState] ?? ""}
                  onChange={(e) =>
                    set(
                      opt.id as keyof FilterState,
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                >
                  <option value="">Todos…</option>
                  {opt.data.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={() => onToggle()}>Aplicar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
