import { CreateScenarioDto, UpdateScenarioDto } from "@/services/api";

// Type for backward compatibility
export interface ScenarioFormData {
  name: string;
  address: string;
  description?: string;
  neighborhood: {
    id: string;
    name: string;
  };
}

export interface NeighborhoodOption {
  id: number;
  name: string;
}

/**
 * Construye un DTO para crear un escenario desde los datos del formulario
 */
export function buildCreateScenarioDto(formData: ScenarioFormData): CreateScenarioDto {
  return {
    name: formData.name.trim(),
    address: formData.address.trim(),
    ...(formData.description && { description: formData.description.trim() }),
    neighborhoodId: Number(formData.neighborhood.id),
  };
}

/**
 * Construye un DTO para actualizar un escenario, incluyendo solo campos modificados
 */
export function buildUpdateScenarioDto(
  formData: ScenarioFormData,
  originalScenario: any // Keep as any for backward compatibility
): UpdateScenarioDto {
  const updateData: UpdateScenarioDto = {};

  // Solo incluir campos que cambiaron
  if (formData.name.trim() !== originalScenario.name) {
    updateData.name = formData.name.trim();
  }

  if (formData.address.trim() !== originalScenario.address) {
    updateData.address = formData.address.trim();
  }

  if (formData.description !== originalScenario.description) {
    updateData.description = formData.description?.trim();
  }

  if (Number(formData.neighborhood.id) !== originalScenario.neighborhood?.id) {
    updateData.neighborhoodId = Number(formData.neighborhood.id);
  }

  return updateData;
}

/**
 * Construye un objeto Scenario completo desde los datos del formulario (para optimistic updates)
 */
export function buildNewScenario(
  formData: ScenarioFormData,
  neighborhoods: NeighborhoodOption[],
  tempId?: number
): any {
  const selectedNeighborhood = neighborhoods.find(
    n => n.id === Number(formData.neighborhood.id)
  );

  return {
    id: tempId || Date.now(), // ID temporal para optimistic updates
    name: formData.name.trim(),
    address: formData.address.trim(),
    description: formData.description?.trim(),
    neighborhood: {
      id: Number(formData.neighborhood.id),
      name: selectedNeighborhood?.name || formData.neighborhood.name || "",
    },
    active: true,
  };
}

/**
 * Construye un objeto Scenario actualizado desde los datos del formulario
 */
export function buildUpdatedScenario(
  formData: ScenarioFormData,
  originalScenario: any,
  neighborhoods: NeighborhoodOption[]
): any {
  const getNeighborhoodName = (): string => {
    // Si el neighborhood no cambió, mantener el nombre original
    if (Number(formData.neighborhood.id) === originalScenario.neighborhood?.id) {
      return originalScenario.neighborhood?.name || "";
    }
    
    // Si cambió, buscar el nombre en la lista de neighborhoods
    const selectedNeighborhood = neighborhoods.find(
      n => n.id === Number(formData.neighborhood.id)
    );
    return selectedNeighborhood?.name || formData.neighborhood.name || "";
  };

  return {
    ...originalScenario,
    name: formData.name.trim(),
    address: formData.address.trim(),
    description: formData.description?.trim(),
    neighborhood: {
      id: Number(formData.neighborhood.id),
      name: getNeighborhoodName(),
    },
  };
}

/**
 * Construye datos de formulario desde un objeto Scenario (para edición)
 */
export function buildFormDataFromScenario(scenario: any): ScenarioFormData {
  return {
    name: scenario.name,
    address: scenario.address,
    description: scenario.description,
    neighborhood: {
      id: scenario.neighborhood?.id?.toString() || "",
      name: scenario.neighborhood?.name || "",
    },
  };
}

/**
 * Helper para encontrar neighborhood por ID y actualizar el nombre
 */
export function updateFormDataWithNeighborhood(
  formData: ScenarioFormData,
  neighborhoodId: string,
  neighborhoods: NeighborhoodOption[]
): ScenarioFormData {
  const selectedNeighborhood = neighborhoods.find(n => n.id === Number(neighborhoodId));
  
  return {
    ...formData,
    neighborhood: {
      id: neighborhoodId,
      name: selectedNeighborhood?.name || "",
    },
  };
}
