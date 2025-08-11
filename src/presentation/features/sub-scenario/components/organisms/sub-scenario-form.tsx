"use client";

import { ImageUploader } from "@/shared/components/organisms/image-uploader";
import { ActivityArea, Scenario } from "@/services/api";
import { Textarea } from "@/shared/ui/textarea";
import { Switch } from "@/shared/ui/switch";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";


interface Props {
  value: any;
  scenarios: Scenario[];
  activityAreas: ActivityArea[];
  fieldSurfaceTypes: { id: number; name: string }[];
  onChange(v: any): void;
  showImages?: boolean;
}

export function SubScenarioForm({
  value,
  scenarios,
  activityAreas,
  fieldSurfaceTypes,
  onChange,
  showImages = false,
}: Props) {
  const set = (k: string, v: any) => onChange({ ...value, [k]: v });

  return (
    <>
      {/* Información Básica */}
      <section className="bg-gray-50 p-3 rounded-md space-y-3">
        <h3 className="font-medium text-sm text-gray-800">
          Información Básica
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Nombre*</Label>
            <Input
              value={value.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Escenario*</Label>
            <select
              className="flex h-9 w-full rounded-md border px-3 py-2 text-sm"
              value={value.scenarioId ?? ""}
              onChange={(e) =>
                set(
                  "scenarioId",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
            >
              <option value="">Seleccione…</option>
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Especificaciones */}
      <section className="bg-gray-50 p-3 rounded-md space-y-3">
        <h3 className="font-medium text-sm text-gray-800">Especificaciones</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Área de Actividad*</Label>
            <select
              className="flex h-9 w-full rounded-md border px-3 py-2 text-sm"
              value={value.activityAreaId ?? ""}
              onChange={(e) =>
                set(
                  "activityAreaId",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
            >
              <option value="">Seleccione…</option>
              {activityAreas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Tipo de Superficie*</Label>
            <select
              className="flex h-9 w-full rounded-md border px-3 py-2 text-sm"
              value={value.fieldSurfaceTypeId ?? ""}
              onChange={(e) =>
                set(
                  "fieldSurfaceTypeId",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
            >
              <option value="">Seleccione…</option>
              {fieldSurfaceTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <InputNumber
            label="Número de Espectadores"
            value={value.numberOfSpectators}
            onChange={(v) => set("numberOfSpectators", v)}
          />
          <InputNumber
            label="Número de Jugadores"
            value={value.numberOfPlayers}
            onChange={(v) => set("numberOfPlayers", v)}
          />
        </div>
      </section>

      {/* Detalles */}
      <section className="bg-gray-50 p-3 rounded-md space-y-3">
        <h3 className="font-medium text-sm text-gray-800">
          Detalles Adicionales
        </h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Recomendaciones</Label>
            <Textarea
              className="resize-none h-20"
              value={value.recommendations}
              onChange={(e) => set("recommendations", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Toggle
              label="Estado Activo"
              checked={value.state}
              onChange={(v) => set("state", v)}
            />
            <Toggle
              label="Tiene Costo"
              checked={value.hasCost}
              onChange={(v) => set("hasCost", v)}
            />
          </div>
        </div>
      </section>

      {showImages && (
        <section className="bg-gray-50 p-3 rounded-md space-y-3">
          <h3 className="font-medium text-sm text-gray-800">Imágenes</h3>
          <ImageUploader
            maxImages={3}
            onChange={(imgs) => set("images", imgs)}
          />
        </section>
      )}
    </>
  );
}

/* ---------- little helpers ---------- */
function InputNumber({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange(v: number): void;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange(v: boolean): void;
}) {
  return (
    <div className="px-2 py-2 flex items-center justify-between bg-white rounded-md">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex flex-col items-end">
        <Switch checked={checked} onCheckedChange={onChange} />
        <span className="text-xs text-gray-500 mt-1">
          {checked ? "Sí" : "No"}
        </span>
      </div>
    </div>
  );
}
