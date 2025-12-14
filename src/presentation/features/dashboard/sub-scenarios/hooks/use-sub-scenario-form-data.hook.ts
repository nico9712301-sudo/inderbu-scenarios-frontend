import { useCallback, useState, useRef, useEffect } from "react";
import { createSubScenarioAction, updateSubScenarioAction, uploadSubScenarioImagesAction } from "@/infrastructure/web/controllers/dashboard/sub-scenario.actions";
import { ImageUploadData, ImageSlotManagement } from "@/application/dashboard/sub-scenarios/use-cases/UploadSubScenarioImagesUseCase";
import { ErrorHandlerResult } from "@/shared/api/error-handler";
import { SubScenario, SubScenarioImage } from "@/shared/api";
import { SubScenarioPlainObject } from "@/entities/sub-scenario/domain/SubScenarioEntity";

// Types
export interface SubScenarioFormData {
  name: string;
  hasCost: boolean;
  hourlyPrice?: number; // Precio por hora (requerido cuando hasCost es true)
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
  active?: boolean; // Assuming active is always true on creation
  images?: ImageUploadData[]; // Optional for creation, required for update
  imageGallery?: {
    featured?: SubScenarioImage;
    additional: SubScenarioImage[];
    count: number;
  };
  imageManagement?: ImageSlotManagement;
}

export interface SubScenarioFormErrors {
  name?: string;
  hourlyPrice?: string;
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
  active: true, // Assuming active is always true on creation
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

  // Validate hourlyPrice when hasCost is true
  if (data.hasCost) {
    if (data.hourlyPrice === undefined || data.hourlyPrice === null) {
      errors.hourlyPrice = "El valor por hora es requerido cuando tiene costo";
    } else if (data.hourlyPrice <= 0) {
      errors.hourlyPrice = "El valor por hora debe ser mayor a 0";
    } else if (data.hourlyPrice > 10000) {
      errors.hourlyPrice = "El valor por hora no puede exceder 10,000 MXN";
    } else {
      // Validate decimal places (max 2)
      const decimalPlaces = (data.hourlyPrice.toString().split('.')[1] || '').length;
      if (decimalPlaces > 2) {
        errors.hourlyPrice = "El valor por hora no puede tener más de 2 decimales";
      }
    }
  }

  if (data.numberOfSpectators < 0) {
    errors.numberOfSpectators = "El nรบmero de espectadores no puede ser negativo";
  }

  if (data.numberOfPlayers < 1) {
    errors.numberOfPlayers = "Debe haber al menos 1 jugador";
  } else if (data.numberOfPlayers > 50) {
    errors.numberOfPlayers = "No puede haber mรกs de 50 jugadores";
  }

  if (data.recommendations && data.recommendations.length > 500) {
    errors.recommendations = "Las recomendaciones no pueden exceder 500 caracteres";
  }

  if (!data.scenario.id) {
    errors.scenarioId = "Debe seleccionar un escenario";
  }

  if (!data.activityArea.id) {
    errors.activityAreaId = "Debe seleccionar un รกrea de actividad";
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

  // Update image management specifically
  const updateImageManagement = useCallback((imageManagement: ImageSlotManagement) => {
    setFormData(prev => ({ ...prev, imageManagement }));
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
      const result = await createSubScenarioAction({
        name: formData.name,
        hasCost: formData.hasCost,
        numberOfSpectators: formData.numberOfSpectators,
        numberOfPlayers: formData.numberOfPlayers,
        recommendations: formData.recommendations,
        scenarioId: parseInt(formData.scenario.id),
        activityAreaId: parseInt(formData.activityArea.id),
        active: formData.active!, // Assuming active is always true on creation
        fieldSurfaceTypeId: parseInt(formData.fieldSurfaceType.id),
      });

      // Step 1.5: Create price if hasCost is true
      if (formData.hasCost && formData.hourlyPrice && result.success) {
        const subScenario: SubScenarioPlainObject = result.data;
        try {
          const { createSubScenarioPriceAction } = await import('@/infrastructure/web/controllers/dashboard/sub-scenario-price.actions');
          await createSubScenarioPriceAction({
            subScenarioId: subScenario.id!,
            hourlyPrice: formData.hourlyPrice,
          });
        } catch (priceError) {
          console.error('Price creation error:', priceError);
          // Sub-scenario was created but price failed - show partial success
          onError?.("Sub-escenario creado, pero falló la configuración del precio");
          onSuccess?.(subScenario as SubScenario);
          return true;
        }
      }

      if (!result.success) {
        onError?.(result.error || "Error al crear sub-escenario");
        return false;
      }

      // Extract the actual sub-scenario data from the backend response
      const subScenario: SubScenarioPlainObject = result.data;
      // console.log("Sub-scenario created with form data:", formData, "and backend response:", subScenario);
      // Step 2: Upload images if any exist
      if (formData.images && formData.images.length > 0) {
        try {
          const imageResult = await uploadSubScenarioImagesAction(subScenario.id!, formData.images);
          
          if (!imageResult.success) {
            // Sub-scenario was created but images failed - show partial success
            onError?.(`Sub-escenario creado, pero fallรณ la subida de imรกgenes: ${imageResult.error}`);
            onSuccess?.(subScenario as SubScenario); // Still call success for the sub-scenario
            return true;
          }
        } catch (imageError) {
          console.error('Image upload error:', imageError);
          // Sub-scenario was created but images failed - show partial success
          onError?.("Sub-escenario creado, pero fallรณ la subida de imรกgenes");
          onSuccess?.(subScenario as SubScenario); // Still call success for the sub-scenario
          return true;
        }
      }

      // Step 3: Success for both sub-scenario and images
      onSuccess?.(subScenario as SubScenario);
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

      // Step 1: Get current sub-scenario to check previous hasCost state
      const { getSubScenarioPriceAction, createSubScenarioPriceAction, updateSubScenarioPriceAction, deleteSubScenarioPriceAction } = await import('@/infrastructure/web/controllers/dashboard/sub-scenario-price.actions');
      const currentPrice = await getSubScenarioPriceAction(id);
      const previousHasCost = currentPrice !== null;

      // Step 2: Update the sub-scenario basic data
      const result = await updateSubScenarioAction(id, {
        name: formData.name,
        hasCost: formData.hasCost,
        numberOfSpectators: formData.numberOfSpectators,
        numberOfPlayers: formData.numberOfPlayers,
        recommendations: formData.recommendations,
        scenarioId: parseInt(formData.scenario.id),
        activityAreaId: parseInt(formData.activityArea.id),
        fieldSurfaceTypeId: parseInt(formData.fieldSurfaceType.id),
      });

      // Step 2.5: Handle price changes
      if (!result.success) {
        onError?.(result.error || "Error al actualizar sub-escenario");
        return false;
      }

      // If hasCost changed from true to false, delete price
      if (previousHasCost && !formData.hasCost) {
        try {
          await deleteSubScenarioPriceAction(id);
        } catch (priceError) {
          console.error('Price deletion error:', priceError);
          // Continue anyway - price deletion is not critical
        }
      }
      // If hasCost is true, create or update price
      else if (formData.hasCost && formData.hourlyPrice) {
        try {
          if (currentPrice) {
            // Update existing price
            await updateSubScenarioPriceAction(id, {
              hourlyPrice: formData.hourlyPrice,
            });
          } else {
            // Create new price
            await createSubScenarioPriceAction({
              subScenarioId: id,
              hourlyPrice: formData.hourlyPrice,
            });
          }
        } catch (priceError) {
          console.error('Price update error:', priceError);
          // Sub-scenario was updated but price failed - show partial success
          onError?.("Sub-escenario actualizado, pero falló la configuración del precio");
          onSuccess?.(result.data as SubScenario);
          return true;
        }
      }

      if (!result.success) {
        onError?.(result.error || "Error al actualizar sub-escenario");
        return false;
      }

      // Step 3: Handle image management if there are changes
      if (formData.imageManagement) {
        try {
          const { ManageSubScenarioImagesUseCase } = await import('@/application/dashboard/sub-scenarios/use-cases/ManageSubScenarioImagesUseCase');
          const imageUseCase = new ManageSubScenarioImagesUseCase();
          
          const imageResult = await imageUseCase.manageAllImages(id, formData.imageManagement);
          
          if (!imageResult.success) {
            // Sub-scenario was updated but images failed - show partial success
            onError?.(`Sub-escenario actualizado, pero fallรณ la gestiรณn de imรกgenes: ${imageResult.error}`);
            onSuccess?.(result.data as SubScenario); // Still call success for the sub-scenario
            return true;
          }
        } catch (imageError) {
          console.error('Image management error:', imageError);
          // Sub-scenario was updated but images failed - show partial success
          onError?.("Sub-escenario actualizado, pero fallรณ la gestiรณn de imรกgenes");
          onSuccess?.(result.data as SubScenario); // Still call success for the sub-scenario
          return true;
        }
      }

      // Step 4: Success for both sub-scenario and images
      onSuccess?.(result.data as SubScenario);
      return true;
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
  const loadSubScenario = useCallback(async (subScenario: SubScenario) => {
    // Load price if hasCost is true
    let hourlyPrice: number | undefined = undefined;
    if (subScenario.hasCost && subScenario.id) {
      try {
        const { getSubScenarioPriceAction } = await import('@/infrastructure/web/controllers/dashboard/sub-scenario-price.actions');
        const price = await getSubScenarioPriceAction(subScenario.id);
        if (price) {
          hourlyPrice = price.hourlyPrice;
        }
      } catch (error) {
        console.error('Error loading price:', error);
        // Continue without price - will be set when user edits
      }
    }

    setFormData({
      name: subScenario.name,
      hasCost: subScenario.hasCost,
      hourlyPrice,
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
      active: subScenario.active ?? true, // Assuming active is always true on creation
      imageGallery: {
        featured: subScenario.imageGallery?.featured || undefined,
        additional: subScenario.imageGallery?.additional || [],
        count: subScenario.imageGallery?.count || 0,
      }
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
    updateImageManagement,
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