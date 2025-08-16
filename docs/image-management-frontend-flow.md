# Gestión de Imágenes de Sub-Escenarios - Flujo Frontend

Este documento describe línea por línea el flujo completo de gestión de imágenes en el frontend para sub-escenarios, incluyendo creación, edición, eliminación y reemplazo de imágenes.

## Arquitectura General

### Componentes Principales

- **`SubScenarioImagesSection`**: Componente principal que maneja el estado de imágenes
- **`SingleImageInput`**: Componente individual para cada slot de imagen (featured, additional1, additional2)
- **`ManageSubScenarioImagesUseCase`**: Use case que coordina uploads y eliminaciones
- **`useSubScenarioForm`**: Hook que maneja el estado del formulario

### Estructura de Datos

```typescript
interface ImageSlotManagement {
  featured: ImageManagementData | null;
  additional1: ImageManagementData | null;
  additional2: ImageManagementData | null;
}

interface ImageManagementData {
  existingImage?: SubScenarioImage;
  newFile?: File;
  action: "keep" | "replace" | "delete";
  isFeature: boolean;
  displayOrder: number;
}
```

## Casos de Uso Detallados

### Caso 1: Creación de Sub-Escenario con Imágenes

#### Ubicación: `src/presentation/features/sub-scenario/components/organisms/create-sub-scenario-dialog.tsx`

**Paso 1: Inicialización del Estado**

```typescript
// Línea 26-30: Estado inicial vacío
const [imageManagement, setImageManagement] = useState<ImageSlotManagement>({
  featured: null,
  additional1: null,
  additional2: null,
});
```

**Paso 2: Usuario Selecciona Imagen**

```typescript
// SingleImageInput.tsx línea 104-116: Manejo de selección de archivo
const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
    // Validación de archivo
    if (!FileValidation.isValidImageType(file)) {
      toast.error(FileValidation.getFileTypeError(file));
      return;
    }

    // Notificar cambio al componente padre
    onChange({
      type: "replace",
      newFile: file,
    });
  }
};
```

**Paso 3: Actualización del Estado de Gestión**

```typescript
// SubScenarioImagesSection.tsx línea 102-108: Manejo de acción 'replace'
} else if (action.type === 'replace' && action.newFile) {
  newSlot = {
    existingImage: currentSlot?.existingImage,
    newFile: action.newFile,
    action: 'replace',
    isFeature: slot === 'featured',
    displayOrder: slot === 'featured' ? 0 : slot === 'additional1' ? 1 : 2
  };
}
```

**Paso 4: Conversión a Array Legacy**

```typescript
// SubScenarioImagesSection.tsx línea 105-121: useEffect que convierte imageManagement
useEffect(() => {
  const newImages: ImageUploadData[] = [];

  if (imageManagement.featured?.newFile) {
    newImages.push({ file: imageManagement.featured.newFile, isFeature: true });
  }
  if (imageManagement.additional1?.newFile) {
    newImages.push({
      file: imageManagement.additional1.newFile,
      isFeature: false,
    });
  }
  if (imageManagement.additional2?.newFile) {
    newImages.push({
      file: imageManagement.additional2.newFile,
      isFeature: false,
    });
  }

  // Solo actualiza si hay cambios reales
  const hasChanged =
    newImages.length !== prevImagesRef.current.length ||
    newImages.some((img, index) => {
      const prevImg = prevImagesRef.current[index];
      return (
        !prevImg ||
        img.file !== prevImg.file ||
        img.isFeature !== prevImg.isFeature
      );
    });

  if (hasChanged) {
    prevImagesRef.current = newImages;
    onChange(newImages); // Notifica al formulario
  }
}, [imageManagement]);
```

**Paso 5: Guardado en Formulario**

```typescript
// use-sub-scenario-form-data.hook.ts línea 186-188: Actualización del estado del formulario
const updateImages = useCallback((images: ImageUploadData[]) => {
  setFormData((prev) => ({ ...prev, images }));
}, []);
```

**Paso 6: Envío al Backend**

```typescript
// use-sub-scenario-form-data.hook.ts línea 234-242: Upload de imágenes tras crear sub-escenario
if (formData.images && formData.images.length > 0) {
  try {
    const imageResult = await uploadSubScenarioImagesAction(
      subScenario.id!,
      formData.images,
    );

    if (!imageResult.success) {
      onError?.(
        `Sub-escenario creado, pero falló la subida de imágenes: ${imageResult.error}`,
      );
      onSuccess?.(subScenario as SubScenario);
      return true;
    }
  } catch (imageError) {
    // Manejo de errores
  }
}
```

### Caso 2: Edición - Carga de Imágenes Existentes

#### Ubicación: `src/presentation/features/sub-scenario/components/organisms/edit-sub-scenario-dialog.tsx`

**Paso 1: Carga del Sub-Escenario**

```typescript
// edit-sub-scenario-dialog.tsx línea 71-75: useEffect para cargar datos
useEffect(() => {
  if (subScenario && open) {
    loadSubScenario(subScenario); // Carga datos en el formulario
  }
}, [subScenario, open, loadSubScenario]);
```

**Paso 2: Mapeo de Imágenes Existentes**

```typescript
// use-sub-scenario-form-data.hook.ts línea 335-361: Función loadSubScenario
const loadSubScenario = useCallback((subScenario: SubScenario) => {
  setFormData({
    // ... otros campos
    imageGallery: {
      featured: subScenario.imageGallery?.featured || undefined,
      additional: subScenario.imageGallery?.additional || [],
      count: subScenario.imageGallery?.count || 0,
    },
  });
  setErrors({});
}, []);
```

**Paso 3: Inicialización del Estado de Gestión**

```typescript
// SubScenarioImagesSection.tsx línea 33-62: useEffect para mapear imágenes por displayOrder
useEffect(() => {
  if (imageGallery) {
    // Map images by their actual displayOrder, not by array position
    const imagesByDisplayOrder = new Map<number, SubScenarioImage>();
    imageGallery.additional.forEach((img) => {
      imagesByDisplayOrder.set(img.displayOrder, img);
    });

    setImageManagement({
      featured: imageGallery.featured
        ? {
            existingImage: imageGallery.featured,
            action: "keep",
            isFeature: true,
            displayOrder: 0,
          }
        : null,
      additional1: imagesByDisplayOrder.get(1)
        ? {
            existingImage: imagesByDisplayOrder.get(1)!,
            action: "keep",
            isFeature: false,
            displayOrder: 1,
          }
        : null,
      additional2: imagesByDisplayOrder.get(2)
        ? {
            existingImage: imagesByDisplayOrder.get(2)!,
            action: "keep",
            isFeature: false,
            displayOrder: 2,
          }
        : null,
    });
  }
}, [imageGallery]);
```

### Caso 3: Eliminación de Imagen Existente

**Paso 1: Usuario Hace Clic en "X"**

```typescript
// SingleImageInput.tsx línea 120-127: Función handleRemove
const handleRemove = () => {
  onChange({
    type: "delete",
    existingImage: isExistingImage
      ? (currentImage as SubScenarioImage)
      : undefined,
  });
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};
```

**Paso 2: Procesamiento de Eliminación**

```typescript
// SubScenarioImagesSection.tsx línea 89-101: Manejo de acción 'delete'
if (action.type === "delete") {
  // If there's an existing image, mark it for deletion
  if (currentSlot?.existingImage || action.existingImage) {
    newSlot = {
      existingImage: currentSlot?.existingImage || action.existingImage,
      action: "delete",
      isFeature: slot === "featured",
      displayOrder: slot === "featured" ? 0 : slot === "additional1" ? 1 : 2,
    };
  } else {
    // No existing image, just clear the slot
    newSlot = null;
  }
}
```

**Paso 3: Actualización del Display**

```typescript
// SubScenarioImagesSection.tsx línea 70-76: Función getImageValue
const getImageValue = (slot: ImageManagementData | null): ImageValue => {
  if (!slot) return null;
  if (slot.action === "delete") return null; // No mostrar imagen marcada para eliminar
  if (slot.newFile) return slot.newFile;
  if (slot.existingImage) return slot.existingImage;
  return null;
};
```

### Caso 4: Reemplazo de Imagen Existente

**Paso 1: Usuario Selecciona Nueva Imagen**

```typescript
// Mismo flujo que creación, pero con existingImage presente
// SingleImageInput.tsx línea 104-116: handleFileSelect
```

**Paso 2: Actualización con Reemplazo**

```typescript
// SubScenarioImagesSection.tsx línea 102-108: Estado de reemplazo
} else if (action.type === 'replace' && action.newFile) {
  newSlot = {
    existingImage: currentSlot?.existingImage, // Mantiene referencia de imagen anterior
    newFile: action.newFile, // Nueva imagen
    action: 'replace',
    isFeature: slot === 'featured',
    displayOrder: slot === 'featured' ? 0 : slot === 'additional1' ? 1 : 2
  };
}
```

### Caso 5: Guardado de Cambios

**Paso 1: Invocación del Use Case**

```typescript
// use-sub-scenario-form-data.hook.ts línea 292-313: handleUpdate
if (formData.imageManagement) {
  try {
    const { ManageSubScenarioImagesUseCase } = await import(
      "@/application/dashboard/sub-scenarios/use-cases/ManageSubScenarioImagesUseCase"
    );
    const imageUseCase = new ManageSubScenarioImagesUseCase();

    const imageResult = await imageUseCase.manageAllImages(
      id,
      formData.imageManagement,
    );

    if (!imageResult.success) {
      onError?.(
        `Sub-escenario actualizado, pero falló la gestión de imágenes: ${imageResult.error}`,
      );
      onSuccess?.(result.data as SubScenario);
      return true;
    }
  } catch (imageError) {
    // Manejo de errores
  }
}
```

**Paso 2: Procesamiento de Eliminaciones**

```typescript
// ManageSubScenarioImagesUseCase.ts línea 94-116: processImageDeletions
async processImageDeletions(subScenarioId: number, imageManagement: ImageSlotManagement): Promise<void> {
  const imagesToDelete: number[] = [];

  const slots = [
    { slot: imageManagement.featured, name: 'featured' },
    { slot: imageManagement.additional1, name: 'additional1' },
    { slot: imageManagement.additional2, name: 'additional2' }
  ];

  for (const { slot, name } of slots) {
    // Si slot tiene action 'delete' y existingImage, marcar para eliminación
    if (slot?.action === 'delete' && slot.existingImage) {
      imagesToDelete.push(slot.existingImage.id);
    }
  }

  // Eliminar cada imagen via DELETE endpoint
  for (const imageId of imagesToDelete) {
    try {
      await httpClient.delete(`/sub-scenarios/${subScenarioId}/images/${imageId}`);
    } catch (error) {
      console.error(`Failed to delete image ${imageId}:`, error);
    }
  }
}
```

**Paso 3: Procesamiento de Uploads**

```typescript
// ManageSubScenarioImagesUseCase.ts línea 15-89: execute
async execute(subScenarioId: number, imageManagement: ImageSlotManagement): Promise<ImageManagementResult> {
  // Recolectar archivos para upload
  const filesToUpload: Array<{ file: File; isFeature: boolean; displayOrder: number }> = [];

  if (imageManagement.featured?.newFile) {
    // Validación
    filesToUpload.push({ file: imageManagement.featured.newFile, isFeature: true, displayOrder: 0 });
  }

  if (imageManagement.additional1?.newFile) {
    // Validación
    filesToUpload.push({ file: imageManagement.additional1.newFile, isFeature: false, displayOrder: 1 });
  }

  if (imageManagement.additional2?.newFile) {
    // Validación
    filesToUpload.push({ file: imageManagement.additional2.newFile, isFeature: false, displayOrder: 2 });
  }

  // Upload via FormData
  if (filesToUpload.length > 0) {
    const formData = new FormData();

    filesToUpload.forEach((fileData, index) => {
      const fileFieldName = `file${index + 1}`;
      const isFeatureFieldName = `isFeature${index + 1}`;
      const displayOrderFieldName = `displayOrder${index + 1}`;

      formData.append(fileFieldName, fileData.file);
      formData.append(isFeatureFieldName, fileData.isFeature ? 'true' : 'false');
      formData.append(displayOrderFieldName, fileData.displayOrder.toString());
    });

    const response = await httpClient.post<{ data: SubScenarioImage[] }>(
      `/sub-scenarios/${subScenarioId}/images`,
      formData
    );
  }
}
```

## Flujos de Estados

### Estado de ImageManagementData por Acción:

1. **Imagen Nueva (Creación)**:

   ```typescript
   {
     newFile: File,
     action: 'replace',
     isFeature: boolean,
     displayOrder: number
   }
   ```

2. **Imagen Existente (Sin cambios)**:

   ```typescript
   {
     existingImage: SubScenarioImage,
     action: 'keep',
     isFeature: boolean,
     displayOrder: number
   }
   ```

3. **Imagen Marcada para Eliminación**:

   ```typescript
   {
     existingImage: SubScenarioImage,
     action: 'delete',
     isFeature: boolean,
     displayOrder: number
   }
   ```

4. **Imagen Reemplazada**:
   ```typescript
   {
     existingImage: SubScenarioImage, // Imagen anterior
     newFile: File, // Nueva imagen
     action: 'replace',
     isFeature: boolean,
     displayOrder: number
   }
   ```

## Validaciones

### Validación de Archivos

```typescript
// FileValidation.isValidImageType()
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// FileValidation.isValidFileSize()
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
```

### Validación de Estados

```typescript
// Prevención de bucles infinitos
const hasChanged =
  newImages.length !== prevImagesRef.current.length ||
  newImages.some((img, index) => {
    const prevImg = prevImagesRef.current[index];
    return (
      !prevImg ||
      img.file !== prevImg.file ||
      img.isFeature !== prevImg.isFeature
    );
  });
```

## Optimizaciones

### Cache de Blob URLs

```typescript
// SingleImageInput.tsx línea 12: Cache global para evitar recreación
const blobUrlCache = new Map<string, string>();

// Línea 49-50: Identidad única para archivos
const fileIdentity = isFile
  ? `${currentImage.name}-${currentImage.size}-${currentImage.lastModified}`
  : null;
```

### Prevención de Re-renders

```typescript
// useCallback para todas las funciones de manejo
const handleImageChange = useCallback(
  (slot: "featured" | "additional1" | "additional2") =>
    (action: ImageChangeAction) => {
      // Lógica de cambio
    },
  [],
);
```

## Casos de Error

### Error de Validación de Archivo

- **Ubicación**: `SingleImageInput.tsx` línea 104-116
- **Acción**: Mostrar toast error, no actualizar estado

### Error de Upload

- **Ubicación**: `ManageSubScenarioImagesUseCase.ts`
- **Acción**: Retornar `{ success: false, error: string }`

### Error de Eliminación

- **Ubicación**: `processImageDeletions`
- **Acción**: Log error, continuar con otras eliminaciones

## Puntos Críticos

1. **Mapeo por DisplayOrder**: Crucial usar `imagesByDisplayOrder.get(1)` no array index
2. **Preservación de Estado**: En eliminación, mantener `existingImage` para el backend
3. **Prevención de Bucles**: Usar `prevImagesRef` para evitar re-renders infinitos
4. **Validación Temprana**: Validar archivos antes de actualizar estado
5. **Limpieza de Blob URLs**: Importante para prevenir memory leaks
