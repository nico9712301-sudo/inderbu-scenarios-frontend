import { useCallback, useState, useRef, useEffect } from "react";
import { SubScenario } from "@/services/api";
import { createSubScenarioAction, updateSubScenarioAction, uploadSubScenarioImagesAction } from "@/infrastructure/web/controllers/dashboard/sub-scenario.actions";
import { ImageUploadData } from "@/application/dashboard/sub-scenarios/use-cases/UploadSubScenarioImagesUseCase";
import { ErrorHandlerResult } from "@/shared/api/error-handler";

// Types
export interface SubScenarioFormData {
  name: string;
  hasCost: boolean;
  numberOfSpectators: number;
  numberOfPlayers: number;
  recommendations: string;
  scenario: {
    id: string;
    name?: string;
  };
  activityArea: {
    id: string;
    name?: string;
  };
  fieldSurfaceType: {
    id: string;
    name?: string;
  };
  images: ImageUploadData[];
}

export interface SubScenarioFormErrors {
  name?: string;
  numberOfSpectators?: string;
  numberOfPlayers?: string;
  recommendations?: string;
  scenarioId?: string;
  activityAreaId?: string;
  fieldSurfaceTypeId?: string;
}

export interface UseSubScenarioFormProps {
  initialData?: SubScenarioFormData;
  onSuccess?: (subScenario: SubScenario) => void;
  onError?: (error: string) => void;
}

// Default form data
const getDefaultFormData = (): SubScenarioFormData => ({
  name: "",
  hasCost: false,
  numberOfSpectators: 0,
  numberOfPlayers: 0,
  recommendations: "",
  scenario: {
    id: "",
    name: "",
  },
  activityArea: {
    id: "",
    name: "",
  },
  fieldSurfaceType: {
    id: "",
    name: "",
  },
  images: [],
});

// Form validation
const validateSubScenarioForm = (data: SubScenarioFormData): SubScenarioFormErrors => {
  const errors: SubScenarioFormErrors = {};

  if (!data.name.trim()) {
    errors.name = "El nombre es requerido";
  } else if (data.name.length < 3) {
    errors.name = "El nombre debe tener al menos 3 caracteres";
  } else if (data.name.length > 100) {
    errors.name = "El nombre no puede exceder 100 caracteres";
  }

  if (data.numberOfSpectators < 0) {
    errors.numberOfSpectators = "El número de espectadores no puede ser negativo";
  }

  if (data.numberOfPlayers < 1) {
    errors.numberOfPlayers = "Debe haber al menos 1 jugador";
  } else if (data.numberOfPlayers > 50) {
    errors.numberOfPlayers = "No puede haber más de 50 jugadores";
  }

  if (data.recommendations && data.recommendations.length > 500) {
    errors.recommendations = "Las recomendaciones no pueden exceder 500 caracteres";
  }

  if (!data.scenario.id) {
    errors.scenarioId = "Debe seleccionar un escenario";
  }

  if (!data.activityArea.id) {
    errors.activityAreaId = "Debe seleccionar un área de actividad";
  }

  if (!data.fieldSurfaceType.id) {
    errors.fieldSurfaceTypeId = "Debe seleccionar un tipo de superficie";
  }

  return errors;
};

export function useSubScenarioForm({ initialData, onSuccess, onError }: UseSubScenarioFormProps = {}) {
  const [formData, setFormData] = useState<SubScenarioFormData>(
    initialData || getDefaultFormData()
  );
  const [errors, setErrors] = useState<SubScenarioFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  // Update form field
  const updateField = useCallback((field: keyof SubScenarioFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field as keyof SubScenarioFormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof SubScenarioFormErrors];
        return newErrors;
      });
    }
  }, [errors]);

  // Update scenario specifically
  const updateScenario = useCallback((id: string, name?: string) => {
    setFormData(prev => ({
      ...prev,
      scenario: { id, name: name || "" }
    }));
    // Clear scenario error
    if (errors.scenarioId) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.scenarioId;
        return newErrors;
      });
    }
  }, [errors.scenarioId]);

  // Update activity area specifically
  const updateActivityArea = useCallback((id: string, name?: string) => {
    setFormData(prev => ({
      ...prev,
      activityArea: { id, name: name || "" }
    }));
    // Clear activity area error
    if (errors.activityAreaId) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.activityAreaId;
        return newErrors;
      });
    }
  }, [errors.activityAreaId]);

  // Update field surface type specifically
  const updateFieldSurfaceType = useCallback((id: string, name?: string) => {
    setFormData(prev => ({
      ...prev,
      fieldSurfaceType: { id, name: name || "" }
    }));
    // Clear field surface type error
    if (errors.fieldSurfaceTypeId) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.fieldSurfaceTypeId;
        return newErrors;
      });
    }
  }, [errors.fieldSurfaceTypeId]);

  // Update images specifically
  const updateImages = useCallback((images: ImageUploadData[]) => {
    setFormData(prev => ({ ...prev, images }));
  }, []);

  // Validate form
  const validate = useCallback(() => {
    const formErrors = validateSubScenarioForm(formData);
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  }, [formData]);

  // Submit form for creation
  const handleCreate = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      if (!validate()) {
        return false;
      }

      // Step 1: Create the sub-scenario without images
      const result: ErrorHandlerResult<SubScenario> = await createSubScenarioAction({
        name: formData.name,
        hasCost: formData.hasCost,
        numberOfSpectators: formData.numberOfSpectators,
        numberOfPlayers: formData.numberOfPlayers,
        recommendations: formData.recommendations,
        scenarioId: parseInt(formData.scenario.id),
        activityAreaId: parseInt(formData.activityArea.id),
        fieldSurfaceTypeId: parseInt(formData.fieldSurfaceType.id),
      });

      if (!result.success) {
        onError?.(result.error || "Error al crear sub-escenario");
        return false;
      }

      // Extract the actual sub-scenario data from the backend response
      const subScenario = result.data.data;

      // Step 2: Upload images if any exist
      if (formData.images.length > 0) {
        try {
          const imageResult = await uploadSubScenarioImagesAction(subScenario.id, formData.images);
          
          if (!imageResult.success) {
            // Sub-scenario was created but images failed - show partial success
            onError?.(`Sub-escenario creado, pero falló la subida de imágenes: ${imageResult.error}`);
            onSuccess?.(subScenario); // Still call success for the sub-scenario
            return true;
          }
        } catch (imageError) {
          console.error('Image upload error:', imageError);
          // Sub-scenario was created but images failed - show partial success
          onError?.("Sub-escenario creado, pero falló la subida de imágenes");
          onSuccess?.(subScenario); // Still call success for the sub-scenario
          return true;
        }
      }

      // Step 3: Success for both sub-scenario and images
      onSuccess?.(subScenario);
      return true;
    } catch (error) {
      console.error('Form submission error:', error);
      onError?.("Error inesperado al crear sub-escenario");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSuccess, onError, validate]);

  // Submit form for update
  const handleUpdate = useCallback(async (id: number) => {
    try {
      setIsSubmitting(true);
      setErrors({});

      if (!validate()) {
        return false;
      }

      const result: ErrorHandlerResult<SubScenario> = await updateSubScenarioAction(id, {
        name: formData.name,
        hasCost: formData.hasCost,
        numberOfSpectators: formData.numberOfSpectators,
        numberOfPlayers: formData.numberOfPlayers,
        recommendations: formData.recommendations,
        scenarioId: parseInt(formData.scenario.id),
        activityAreaId: parseInt(formData.activityArea.id),
        fieldSurfaceTypeId: parseInt(formData.fieldSurfaceType.id),
      });

      if (result.success) {
        onSuccess?.(result.data);
        return true;
      } else {
        onError?.(result.error || "Error al actualizar sub-escenario");
        return false;
      }
    } catch (error) {
      console.error('Form submission error:', error);
      onError?.("Error inesperado al actualizar sub-escenario");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSuccess, onError, validate]);

  // Reset form
  const reset = useCallback((newData?: SubScenarioFormData) => {
    setFormData(newData || getDefaultFormData());
    setErrors({});
    setIsSubmitting(false);
  }, []);

  // Load sub-scenario data for editing
  const loadSubScenario = useCallback((subScenario: SubScenario) => {
    setFormData({
      name: subScenario.name,
      hasCost: subScenario.hasCost,
      numberOfSpectators: subScenario.numberOfSpectators || 0,
      numberOfPlayers: subScenario.numberOfPlayers || 0,
      recommendations: subScenario.recommendations || "",
      scenario: {
        id: subScenario.scenario?.id?.toString() || "",
        name: subScenario.scenario?.name || "",
      },
      activityArea: {
        id: subScenario.activityArea?.id?.toString() || "",
        name: subScenario.activityArea?.name || "",
      },
      fieldSurfaceType: {
        id: subScenario.fieldSurfaceType?.id?.toString() || "",
        name: subScenario.fieldSurfaceType?.name || "",
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
    updateScenario,
    updateActivityArea,
    updateFieldSurfaceType,
    updateImages,
    validate,
    handleCreate,
    handleUpdate,
    reset,
    loadSubScenario,
    
    // Helpers
    hasError: (field: keyof SubScenarioFormErrors) => !!errors[field],
    getError: (field: keyof SubScenarioFormErrors) => errors[field],
  };
}