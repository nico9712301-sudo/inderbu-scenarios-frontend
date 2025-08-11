import { IScenarioFormData } from "@/application/dashboard/scenarios/commands/ScenarioCommands";
import { useCallback, useState } from "react";

// Types
export interface ScenarioFormData {
  name: string;
  address: string;
  description?: string;
  neighborhood: {
    id: string;
    name?: string;
  };
}

export interface ScenarioFormErrors {
  name?: string;
  address?: string;
  description?: string;
  neighborhoodId?: string;
}

export interface UseScenarioFormProps {
  initialData?: ScenarioFormData;
  onSubmit?: (data: IScenarioFormData) => Promise<void>;
}

// Default form data
const getDefaultFormData = (): ScenarioFormData => ({
  name: "",
  address: "",
  description: "",
  neighborhood: {
    id: "",
    name: "",
  },
});

// Form validation
const validateScenarioForm = (data: ScenarioFormData): ScenarioFormErrors => {
  const errors: ScenarioFormErrors = {};

  if (!data.name.trim()) {
    errors.name = "El nombre es requerido";
  } else if (data.name.length < 3) {
    errors.name = "El nombre debe tener al menos 3 caracteres";
  } else if (data.name.length > 100) {
    errors.name = "El nombre no puede exceder 100 caracteres";
  }

  if (!data.address.trim()) {
    errors.address = "La dirección es requerida";
  } else if (data.address.length < 10) {
    errors.address = "La dirección debe tener al menos 10 caracteres";
  } else if (data.address.length > 150) {
    errors.address = "La dirección no puede exceder 150 caracteres";
  }

  if (data.description && data.description.length > 500) {
    errors.description = "La descripción no puede exceder 500 caracteres";
  }

  if (!data.neighborhood.id) {
    errors.neighborhoodId = "Debe seleccionar un barrio";
  }

  return errors;
};

export function useScenarioForm({ initialData, onSubmit }: UseScenarioFormProps = {}) {
  const [formData, setFormData] = useState<ScenarioFormData>(
    initialData || getDefaultFormData()
  );
  const [errors, setErrors] = useState<ScenarioFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form field
  const updateField = useCallback((field: keyof ScenarioFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field as keyof ScenarioFormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof ScenarioFormErrors];
        return newErrors;
      });
    }
  }, [errors]);

  // Update neighborhood specifically
  const updateNeighborhood = useCallback((id: string, name?: string) => {
    setFormData(prev => ({
      ...prev,
      neighborhood: { id, name: name || "" }
    }));
    // Clear neighborhood error
    if (errors.neighborhoodId) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.neighborhoodId;
        return newErrors;
      });
    }
  }, [errors.neighborhoodId]);

  // Validate form
  const validate = useCallback(() => {
    const formErrors = validateScenarioForm(formData);
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  }, [formData]);

  // Submit form
  const handleSubmit = useCallback(async () => {
    if (!onSubmit) return false;

    try {
      setIsSubmitting(true);
      setErrors({});

      if (!validate()) {
        return false;
      }

      await onSubmit({
        name: formData.name,
        address: formData.address,
        description: formData.description,
        neighborhoodId: parseInt(formData.neighborhood.id),
      });
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit, validate]);

  // Reset form
  const reset = useCallback((newData?: ScenarioFormData) => {
    setFormData(newData || getDefaultFormData());
    setErrors({});
    setIsSubmitting(false);
  }, []);

  // Load scenario data for editing
  const loadScenario = useCallback((scenario: any) => {
    setFormData({
      name: scenario.name,
      address: scenario.address,
      description: scenario.description || "",
      neighborhood: {
        id: scenario.neighborhood?.id?.toString() || "",
        name: scenario.neighborhood?.name || "",
      },
    });
    setErrors({});
  }, []);

  return {
    // Data
    formData,
    errors,
    isSubmitting,
    isValid: Object.keys(errors).length === 0,
    
    // Actions
    updateField,
    updateNeighborhood,
    validate,
    handleSubmit,
    reset,
    loadScenario,
    
    // Helpers
    hasError: (field: keyof ScenarioFormErrors) => !!errors[field],
    getError: (field: keyof ScenarioFormErrors) => errors[field],
  };
}
