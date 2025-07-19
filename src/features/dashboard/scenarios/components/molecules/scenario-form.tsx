"use client";

import { MapPin } from "lucide-react";
import { memo } from "react";

import { SearchSelect } from "@/shared/components/molecules/search-select";
import { searchNeighborhoods } from "@/features/home/services/home.service";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { 
  ScenarioFormData, 
  ScenarioFormErrors,
  useScenarioForm 
} from "../../hooks/use-scenario-form";
import { updateFormDataWithNeighborhood } from "../../utils/scenario-builders";

interface NeighborhoodOption {
  id: number;
  name: string;
}

interface ScenarioFormProps {
  formData: ScenarioFormData;
  errors: ScenarioFormErrors;
  neighborhoods: NeighborhoodOption[];
  onFieldChange: (field: keyof ScenarioFormData, value: string) => void;
  onNeighborhoodChange: (id: string, name?: string) => void;
  onErrorClear: (field: keyof ScenarioFormErrors) => void;
  selectedScenario?: any; // For edit mode
}

const ValidatedInput = memo(({
  id,
  label,
  value,
  onChange,
  error,
  placeholder,
  required,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) => (
  <div className="space-y-1">
    <Label htmlFor={id} className="text-sm font-medium">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </Label>
    <Input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`bg-white h-9 ${error ? "border-red-500 focus:border-red-500" : ""} ${className || ""}`}
    />
    {error && <p className="text-sm text-red-600">{error}</p>}
  </div>
));
ValidatedInput.displayName = "ValidatedInput";

export const ScenarioForm = memo(({
  formData,
  errors,
  neighborhoods,
  onFieldChange,
  onNeighborhoodChange,
  onErrorClear,
  selectedScenario,
}: ScenarioFormProps) => {
  return (
    <div className="space-y-4">
      {/* Ubicación Section */}
      <div className="bg-gray-50 p-3 rounded-md">
        <h3 className="font-medium text-gray-800 mb-2 text-sm flex items-center">
          <MapPin className="h-3 w-3 mr-1 text-teal-600" />
          Ubicación
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Neighborhood Select */}
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Barrio
              <span className="text-red-500 ml-1">*</span>
            </label>
            <SearchSelect
              placeholder="Seleccione barrio..."
              searchPlaceholder="Buscar barrio..."
              icon={MapPin}
              value={formData.neighborhood.id}
              onValueChange={(value) => {
                const selectedNeighborhood = neighborhoods.find(n => n.id === Number(value));
                onNeighborhoodChange(String(value || ""), selectedNeighborhood?.name);
                if (errors.neighborhoodId) {
                  onErrorClear('neighborhoodId');
                }
              }}
              onSearch={async (query) => {
                const results = await searchNeighborhoods(query);
                // For edit mode, ensure current neighborhood is always available
                if (selectedScenario?.neighborhood) {
                  const currentNeighborhood = selectedScenario.neighborhood;
                  if (!results.find(n => n.id === currentNeighborhood.id)) {
                    return [currentNeighborhood, ...results];
                  }
                }
                return results;
              }}
              emptyMessage="No se encontraron barrios"
              className="w-full"
            />
            {errors.neighborhoodId && (
              <p className="text-sm text-red-600">{errors.neighborhoodId}</p>
            )}
          </div>

          {/* Address Input */}
          <ValidatedInput
            id="scenario-address"
            label="Dirección"
            value={formData.address}
            onChange={(value) => onFieldChange("address", value)}
            error={errors.address}
            placeholder="Dirección completa"
            required
          />
        </div>
      </div>

      {/* Información General Section */}
      <div className="bg-gray-50 p-3 rounded-md">
        <h3 className="font-medium text-gray-800 mb-2 text-sm">
          Información General
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {/* Name Input */}
          <ValidatedInput
            id="scenario-name"
            label="Nombre del Escenario"
            value={formData.name}
            onChange={(value) => onFieldChange("name", value)}
            error={errors.name}
            placeholder="Ingrese nombre del escenario"
            required
          />

        </div>
      </div>
    </div>
  );
});

ScenarioForm.displayName = "ScenarioForm";