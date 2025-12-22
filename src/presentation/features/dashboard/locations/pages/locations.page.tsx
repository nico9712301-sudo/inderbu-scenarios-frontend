"use client";

// Dropdown menu removed for communes/neighborhoods per request
import {
  Building2,
  Download,
  FileEdit,
  Loader2,
  MapPin,
  Plus,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { createNeighborhoodAction, updateNeighborhoodAction } from "@/infrastructure/web/controllers/dashboard/neighborhood.actions";
import { DashboardPagination } from "@/shared/components/organisms/dashboard-pagination";
import { createCommuneAction, updateCommuneAction } from "@/infrastructure/web/controllers/dashboard/commune.actions";
import { ILocationsDataClientResponse } from '@/presentation/utils/serialization.utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useState, useEffect, useRef } from "react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toast } from "sonner";

// COMPONENTES VALIDADOS REUTILIZABLES
interface ValidatedInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const ValidatedInput = memo(
  ({
    id,
    label,
    value,
    onChange,
    error,
    placeholder,
    required,
    className,
  }: ValidatedInputProps) => (
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
  )
);
ValidatedInput.displayName = "ValidatedInput";

interface ValidatedSelectProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  options: { id: number; name: string }[];
  error?: string;
  placeholder?: string;
  required?: boolean;
}

const ValidatedSelect = memo(
  ({
    id,
    label,
    value,
    onChange,
    options,
    error,
    placeholder,
    required,
  }: ValidatedSelectProps) => (
    <div className="space-y-1">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`flex h-9 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          error ? "border-red-500 focus-visible:ring-red-500" : ""
        }`}
      >
        <option value="">{placeholder || "Seleccione una opción..."}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
);
ValidatedSelect.displayName = "ValidatedSelect";

// Interfaces para formularios
interface CommuneFormData {
  name: string;
  cityId: number | "";
}

interface NeighborhoodFormData {
  name: string;
  communeId: number | "";
}

interface CommuneFormErrors {
  name?: string;
  cityId?: string;
}

interface NeighborhoodFormErrors {
  name?: string;
  communeId?: string;
}

interface LocationsPageProps {
  initialData: ILocationsDataClientResponse;
}

export function LocationsPage({ initialData }: LocationsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use the data that comes from the server (already paginated and calculated)
  const {
    communes,
    neighborhoods,
    cities,
    communePageMeta: serverCommunePageMeta,
    neighborhoodPageMeta: serverNeighborhoodPageMeta,
    communeFilters,
    neighborhoodFilters
  } = initialData;
  
  const allCommunes = communes; // For forms
  
  // Transform server PageMeta to match DashboardPagination expectations
  // Calculate hasNext and hasPrev manually since server doesn't send them
  const communePageMeta = serverCommunePageMeta ? {
    page: serverCommunePageMeta.page,
    limit: serverCommunePageMeta.limit,
    totalItems: serverCommunePageMeta.totalItems,
    totalPages: serverCommunePageMeta.totalPages,
    hasNext: serverCommunePageMeta.page < serverCommunePageMeta.totalPages,
    hasPrev: serverCommunePageMeta.page > 1,
  } : null;
  
  const neighborhoodPageMeta = serverNeighborhoodPageMeta ? {
    page: serverNeighborhoodPageMeta.page,
    limit: serverNeighborhoodPageMeta.limit,
    totalItems: serverNeighborhoodPageMeta.totalItems,
    totalPages: serverNeighborhoodPageMeta.totalPages,
    hasNext: serverNeighborhoodPageMeta.page < serverNeighborhoodPageMeta.totalPages,
    hasPrev: serverNeighborhoodPageMeta.page > 1,
  } : null;

  // Pagination handlers with smooth navigation like sub-scenarios
  const handleCommunePageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('communePage', newPage.toString());
    const queryString = params.toString();
    router.push(`/dashboard/locations?${queryString}`);
  };

  const handleNeighborhoodPageChange = (newPage: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('neighborhoodPage', newPage.toString());
    const queryString = params.toString();
    router.push(`/dashboard/locations?${queryString}`);
  };

  const handleCommuneLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('communeLimit', newLimit.toString());
    params.set('communePage', '1'); // Reset to first page
    
    const queryString = params.toString();
    router.push(`/dashboard/locations?${queryString}`);
  };

  const handleNeighborhoodLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('neighborhoodLimit', newLimit.toString());
    params.set('neighborhoodPage', '1'); // Reset to first page
    
    const queryString = params.toString();
    router.push(`/dashboard/locations?${queryString}`);
  };

  // Loading state
  const [loading, setLoading] = useState(false);

  // Search states (local for debouncing)
  const [localCommuneSearch, setLocalCommuneSearch] = useState(communeFilters.search || "");
  const [localNeighborhoodSearch, setLocalNeighborhoodSearch] = useState(neighborhoodFilters.search || "");
  
  // Debounce refs
  const communeSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const neighborhoodSearchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || "communes");
  const [isCommuneModalOpen, setIsCommuneModalOpen] = useState(false);
  const [isCommuneEditOpen, setIsCommuneEditOpen] = useState(false);
  const [isNeighborhoodModalOpen, setIsNeighborhoodModalOpen] = useState(false);
  const [isNeighborhoodEditOpen, setIsNeighborhoodEditOpen] = useState(false);

  const [selectedCommune, setSelectedCommune] = useState<any | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<any | null>(null);

  // Form states
  const [createCommuneData, setCreateCommuneData] = useState<CommuneFormData>({
    name: "",
    cityId: "",
  });

  const [updateCommuneData, setUpdateCommuneData] = useState<CommuneFormData>({
    name: "",
    cityId: "",
  });

  const [createNeighborhoodData, setCreateNeighborhoodData] = useState<NeighborhoodFormData>({
    name: "",
    communeId: "",
  });

  const [updateNeighborhoodData, setUpdateNeighborhoodData] = useState<NeighborhoodFormData>({
    name: "",
    communeId: "",
  });

  const [communeFormErrors, setCommuneFormErrors] = useState<CommuneFormErrors>({});
  const [neighborhoodFormErrors, setNeighborhoodFormErrors] = useState<NeighborhoodFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateCommuneForm = (data: CommuneFormData): CommuneFormErrors => {
    const errors: CommuneFormErrors = {};

    if (!data.name.trim()) {
      errors.name = "El nombre es requerido";
    } else if (data.name.length < 3) {
      errors.name = "El nombre debe tener al menos 3 caracteres";
    } else if (data.name.length > 150) {
      errors.name = "El nombre no puede exceder 150 caracteres";
    }

    if (!data.cityId) {
      errors.cityId = "Debe seleccionar una ciudad";
    }

    return errors;
  };

  const validateNeighborhoodForm = (data: NeighborhoodFormData): NeighborhoodFormErrors => {
    const errors: NeighborhoodFormErrors = {};

    if (!data.name.trim()) {
      errors.name = "El nombre es requerido";
    } else if (data.name.length < 3) {
      errors.name = "El nombre debe tener al menos 3 caracteres";
    } else if (data.name.length > 150) {
      errors.name = "El nombre no puede exceder 150 caracteres";
    }

    if (!data.communeId) {
      errors.communeId = "Debe seleccionar una comuna";
    }

    return errors;
  };

  // CRUD handlers for Communes
  const handleCreateCommune = async () => {
    try {
      setIsSubmitting(true);
      setCommuneFormErrors({});

      const errors = validateCommuneForm(createCommuneData);
      if (Object.keys(errors).length > 0) {
        setCommuneFormErrors(errors);
        return;
      }

      const createData = {
        name: createCommuneData.name.trim(),
        cityId: Number(createCommuneData.cityId),
      };

      const result = await createCommuneAction(createData);

      if (result.success) {
        setCreateCommuneData({ name: "", cityId: "" });
        setIsCommuneModalOpen(false);
        toast.success("Comuna creada exitosamente", {
          description: `${(result.data as { name: string }).name} ha sido registrada en el sistema.`,
        });
        router.refresh();
      } else {
        toast.error("Error al crear comuna", {
          description: result.error,
        });
      }
    } catch (error: any) {
      console.error("Error creating commune:", error);
      toast.error("Error al crear comuna", {
        description: error.message || "Ocurrió un error inesperado. Intente nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCommune = async () => {
    if (!selectedCommune) return;

    try {
      setIsSubmitting(true);
      setCommuneFormErrors({});

      const errors = validateCommuneForm(updateCommuneData);
      if (Object.keys(errors).length > 0) {
        setCommuneFormErrors(errors);
        return;
      }

      const updateData: any = {};

      if (updateCommuneData.name.trim() !== selectedCommune.name) {
        updateData.name = updateCommuneData.name.trim();
      }

      if (Number(updateCommuneData.cityId) !== selectedCommune.city?.id) {
        updateData.cityId = Number(updateCommuneData.cityId);
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("No se detectaron cambios");
        setIsCommuneEditOpen(false);
        return;
      }

      const result = await updateCommuneAction(selectedCommune.id, updateData);

      if (result.success) {
        setIsCommuneEditOpen(false);
        setSelectedCommune(null);
        toast.success("Comuna actualizada exitosamente");
        router.refresh();
      } else {
        toast.error("Error al actualizar comuna", {
          description: result.error,
        });
      }
    } catch (error: any) {
      console.error("Error updating commune:", error);
      toast.error("Error al actualizar comuna");
    } finally {
      setIsSubmitting(false);
    }
  };

  // CRUD handlers for Neighborhoods
  const handleCreateNeighborhood = async () => {
    try {
      setIsSubmitting(true);
      setNeighborhoodFormErrors({});

      const errors = validateNeighborhoodForm(createNeighborhoodData);
      if (Object.keys(errors).length > 0) {
        setNeighborhoodFormErrors(errors);
        return;
      }

      const createData = {
        name: createNeighborhoodData.name.trim(),
        communeId: Number(createNeighborhoodData.communeId),
      };

      const result = await createNeighborhoodAction(createData);

      if (result.success) {
        setCreateNeighborhoodData({ name: "", communeId: "" });
        setIsNeighborhoodModalOpen(false);
        toast.success("Barrio creado exitosamente");
        router.refresh();
      } else {
        toast.error("Error al crear barrio", {
          description: result.error,
        });
      }
    } catch (error: any) {
      console.error("Error creating neighborhood:", error);
      toast.error("Error al crear barrio");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateNeighborhood = async () => {
    if (!selectedNeighborhood) return;

    try {
      setIsSubmitting(true);
      setNeighborhoodFormErrors({});

      const errors = validateNeighborhoodForm(updateNeighborhoodData);
      if (Object.keys(errors).length > 0) {
        setNeighborhoodFormErrors(errors);
        return;
      }

      const updateData: any = {};

      if (updateNeighborhoodData.name.trim() !== selectedNeighborhood.name) {
        updateData.name = updateNeighborhoodData.name.trim();
      }

      if (Number(updateNeighborhoodData.communeId) !== selectedNeighborhood.commune?.id) {
        updateData.communeId = Number(updateNeighborhoodData.communeId);
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("No se detectaron cambios");
        setIsNeighborhoodEditOpen(false);
        return;
      }

      const result = await updateNeighborhoodAction(selectedNeighborhood.id, updateData);

      if (result.success) {
        setIsNeighborhoodEditOpen(false);
        setSelectedNeighborhood(null);
        toast.success("Barrio actualizado exitosamente");
        router.refresh();
      } else {
        toast.error("Error al actualizar barrio", {
          description: result.error,
        });
      }
    } catch (error: any) {
      console.error("Error updating neighborhood:", error);
      toast.error("Error al actualizar barrio");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form handlers
  const handleCreateCommuneFieldChange = useCallback(
    (field: keyof CommuneFormData, value: string | number) => {
      setCreateCommuneData((prev) => ({ ...prev, [field]: value }));
      setCommuneFormErrors((prev) => {
        if (prev[field as keyof CommuneFormErrors]) {
          const newErrors = { ...prev };
          delete newErrors[field as keyof CommuneFormErrors];
          return newErrors;
        }
        return prev;
      });
    },
    []
  );

  const handleUpdateCommuneFieldChange = useCallback(
    (field: keyof CommuneFormData, value: string | number) => {
      setUpdateCommuneData((prev) => ({ ...prev, [field]: value }));
      setCommuneFormErrors((prev) => {
        if (prev[field as keyof CommuneFormErrors]) {
          const newErrors = { ...prev };
          delete newErrors[field as keyof CommuneFormErrors];
          return newErrors;
        }
        return prev;
      });
    },
    []
  );

  const handleCreateNeighborhoodFieldChange = useCallback(
    (field: keyof NeighborhoodFormData, value: string | number) => {
      setCreateNeighborhoodData((prev) => ({ ...prev, [field]: value }));
      setNeighborhoodFormErrors((prev) => {
        if (prev[field as keyof NeighborhoodFormErrors]) {
          const newErrors = { ...prev };
          delete newErrors[field as keyof NeighborhoodFormErrors];
          return newErrors;
        }
        return prev;
      });
    },
    []
  );

  const handleUpdateNeighborhoodFieldChange = useCallback(
    (field: keyof NeighborhoodFormData, value: string | number) => {
      setUpdateNeighborhoodData((prev) => ({ ...prev, [field]: value }));
      setNeighborhoodFormErrors((prev) => {
        if (prev[field as keyof NeighborhoodFormErrors]) {
          const newErrors = { ...prev };
          delete newErrors[field as keyof NeighborhoodFormErrors];
          return newErrors;
        }
        return prev;
      });
    },
    []
  );

  const handleOpenCommuneEdit = (commune: any) => {
    setSelectedCommune(commune);
    setUpdateCommuneData({
      name: commune.name,
      cityId: commune.city?.id || "",
    });
    setCommuneFormErrors({});
    setIsCommuneEditOpen(true);
  };

  const handleOpenNeighborhoodEdit = (neighborhood: any) => {
    setSelectedNeighborhood(neighborhood);
    setUpdateNeighborhoodData({
      name: neighborhood.name,
      communeId: neighborhood.commune?.id || "",
    });
    setNeighborhoodFormErrors({});
    setIsNeighborhoodEditOpen(true);
  };

  // Optimized search handlers with debouncing
  const handleCommuneSearchChange = useCallback((value: string) => {
    // Update local state immediately for responsive UI
    setLocalCommuneSearch(value);
    
    // Clear previous timeout
    if (communeSearchTimeoutRef.current) {
      clearTimeout(communeSearchTimeoutRef.current);
    }
    
    // Set new timeout for actual search
    communeSearchTimeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (value.trim()) {
        params.set('communeSearch', value.trim());
      } else {
        params.delete('communeSearch');
      }
      params.set('communePage', '1'); // Reset to first page on new search
      const queryString = params.toString();
      router.push(`/dashboard/locations?${queryString}`);
    }, 500); // 500ms debounce
  }, [router]);

  const handleNeighborhoodSearchChange = useCallback((value: string) => {
    // Update local state immediately for responsive UI
    setLocalNeighborhoodSearch(value);
    
    // Clear previous timeout
    if (neighborhoodSearchTimeoutRef.current) {
      clearTimeout(neighborhoodSearchTimeoutRef.current);
    }
    
    // Set new timeout for actual search
    neighborhoodSearchTimeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (value.trim()) {
        params.set('neighborhoodSearch', value.trim());
      } else {
        params.delete('neighborhoodSearch');
      }
      params.set('neighborhoodPage', '1'); // Reset to first page on new search
      const queryString = params.toString();
      router.push(`/dashboard/locations?${queryString}`);
    }, 500); // 500ms debounce
  }, [router]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (communeSearchTimeoutRef.current) {
        clearTimeout(communeSearchTimeoutRef.current);
      }
      if (neighborhoodSearchTimeoutRef.current) {
        clearTimeout(neighborhoodSearchTimeoutRef.current);
      }
    };
  }, []);

  // Sync local search states when server data changes
  useEffect(() => {
    setLocalCommuneSearch(communeFilters.search || "");
  }, [communeFilters.search]);

  useEffect(() => {
    setLocalNeighborhoodSearch(neighborhoodFilters.search || "");
  }, [neighborhoodFilters.search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          Gestión de Ubicaciones
        </h1>
        <div className="flex items-center gap-2">
          {activeTab === "communes" ? (
            <Button onClick={() => setIsCommuneModalOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Comuna
            </Button>
          ) : (
            <Button onClick={() => setIsNeighborhoodModalOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Barrio
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="communes">Comunas</TabsTrigger>
            <TabsTrigger value="neighborhoods">Barrios</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Tab Comunas */}
        <TabsContent value="communes" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Listado de Comunas</CardTitle>
                  <Badge variant="outline" className="ml-2">
                    {communePageMeta?.totalItems || communes.length}
                  </Badge>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar comuna..."
                    className="pl-8"
                    value={localCommuneSearch}
                    onChange={(e) => handleCommuneSearchChange(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Nombre
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Ciudad
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center"
                        >
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mr-2" />
                            Cargando comunas…
                          </div>
                        </td>
                      </tr>
                    ) : communes.length > 0 ? (
                      communes.map((commune) => (
                        <tr
                          key={commune.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-sm">{commune.id}</td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {commune.name || "Sin nombre"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {commune.city?.name || "No asignada"}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenCommuneEdit(commune)}
                                className="h-8 px-2 py-0"
                              >
                                <FileEdit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                              {/* three-dots menu removed per request */}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-sm text-gray-500"
                        >
                          No se encontraron comunas con los filtros aplicados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación para Comunas */}
              {communePageMeta && (
                <div className="border-t p-4">
                  <DashboardPagination
                    meta={communePageMeta}
                    onPageChange={handleCommunePageChange}
                    onLimitChange={handleCommuneLimitChange}
                    showLimitSelector={true}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Barrios */}
        <TabsContent value="neighborhoods" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Listado de Barrios</CardTitle>
                  <Badge variant="outline" className="ml-2">
                    {neighborhoodPageMeta?.totalItems || neighborhoods.length}
                  </Badge>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar barrio..."
                    className="pl-8"
                    value={localNeighborhoodSearch}
                    onChange={(e) => handleNeighborhoodSearchChange(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Comuna
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Nombre
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center"
                        >
                          <div className="flex items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mr-2" />
                            Cargando barrios…
                          </div>
                        </td>
                      </tr>
                    ) : neighborhoods.length > 0 ? (
                      neighborhoods.map((neighborhood) => (
                        <tr
                          key={neighborhood.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 text-sm">
                            {neighborhood.id}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {neighborhood.communeName || "No asignada"}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            {neighborhood.name}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleOpenNeighborhoodEdit(neighborhood)
                                }
                                className="h-8 px-2 py-0"
                              >
                                <FileEdit className="h-4 w-4 mr-1" />
                                Editar
                              </Button>
                              {/* three-dots menu removed per request */}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-8 text-center text-sm text-gray-500"
                        >
                          No se encontraron barrios con los filtros aplicados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación para Barrios */}
              {neighborhoodPageMeta && (
                <div className="border-t p-4">
                  <DashboardPagination
                    meta={neighborhoodPageMeta}
                    onPageChange={handleNeighborhoodPageChange}
                    onLimitChange={handleNeighborhoodLimitChange}
                    showLimitSelector={true}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Crear Comuna */}
      <Dialog open={isCommuneModalOpen} onOpenChange={setIsCommuneModalOpen}>
        <DialogContent className="w-[500px] max-h-[80vh] mx-auto bg-white overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl text-teal-700">
              Crear Comuna
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="font-medium text-gray-800 mb-2 text-sm flex items-center">
                <Building2 className="h-3 w-3 mr-1 text-teal-600" />
                Información de la Comuna
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <ValidatedInput
                  id="new-commune-name"
                  label="Nombre de la Comuna"
                  value={createCommuneData.name}
                  onChange={(value) =>
                    handleCreateCommuneFieldChange("name", value)
                  }
                  error={communeFormErrors.name}
                  placeholder="Ingrese nombre de la comuna"
                  required
                />

                <ValidatedSelect
                  id="new-commune-city"
                  label="Ciudad"
                  value={createCommuneData.cityId}
                  onChange={(value) =>
                    handleCreateCommuneFieldChange("cityId", value)
                  }
                  options={cities}
                  error={communeFormErrors.cityId}
                  placeholder="Seleccione ciudad..."
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 pt-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsCommuneModalOpen(false);
                setCreateCommuneData({ name: "", cityId: "" });
                setCommuneFormErrors({});
              }}
              size="sm"
              className="px-4"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 px-4"
              onClick={handleCreateCommune}
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Comuna */}
      <Dialog open={isCommuneEditOpen} onOpenChange={setIsCommuneEditOpen}>
        <DialogContent className="w-[500px] max-h-[80vh] mx-auto bg-white overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl text-teal-700">
              {selectedCommune
                ? `Editar Comuna: ${selectedCommune.name}`
                : "Editar Comuna"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedCommune && (
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2 text-sm flex items-center">
                  <Building2 className="h-3 w-3 mr-1 text-teal-600" />
                  Información de la Comuna
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <ValidatedInput
                    id="edit-commune-name"
                    label="Nombre de la Comuna"
                    value={updateCommuneData.name}
                    onChange={(value) =>
                      handleUpdateCommuneFieldChange("name", value)
                    }
                    error={communeFormErrors.name}
                    required
                  />

                  <ValidatedSelect
                    id="edit-commune-city"
                    label="Ciudad"
                    value={updateCommuneData.cityId}
                    onChange={(value) =>
                      handleUpdateCommuneFieldChange("cityId", value)
                    }
                    options={cities}
                    error={communeFormErrors.cityId}
                    placeholder="Seleccione ciudad..."
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-end gap-3 pt-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsCommuneEditOpen(false);
                setSelectedCommune(null);
                setCommuneFormErrors({});
              }}
              className="px-4"
              size="sm"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 px-4"
              size="sm"
              onClick={handleUpdateCommune}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Crear Barrio */}
      <Dialog
        open={isNeighborhoodModalOpen}
        onOpenChange={setIsNeighborhoodModalOpen}
      >
        <DialogContent className="w-[500px] max-h-[80vh] mx-auto bg-white overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl text-teal-700">
              Crear Barrio
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="font-medium text-gray-800 mb-2 text-sm flex items-center">
                <MapPin className="h-3 w-3 mr-1 text-teal-600" />
                Información del Barrio
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <ValidatedSelect
                  id="new-neighborhood-commune"
                  label="Comuna"
                  value={createNeighborhoodData.communeId}
                  onChange={(value) =>
                    handleCreateNeighborhoodFieldChange("communeId", value)
                  }
                  options={allCommunes}
                  error={neighborhoodFormErrors.communeId}
                  placeholder="Seleccione comuna..."
                  required
                />

                <ValidatedInput
                  id="new-neighborhood-name"
                  label="Nombre del Barrio"
                  value={createNeighborhoodData.name}
                  onChange={(value) =>
                    handleCreateNeighborhoodFieldChange("name", value)
                  }
                  error={neighborhoodFormErrors.name}
                  placeholder="Ingrese nombre del barrio"
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 pt-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsNeighborhoodModalOpen(false);
                setCreateNeighborhoodData({ name: "", communeId: "" });
                setNeighborhoodFormErrors({});
              }}
              size="sm"
              className="px-4"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 px-4"
              onClick={handleCreateNeighborhood}
              size="sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Barrio */}
      <Dialog
        open={isNeighborhoodEditOpen}
        onOpenChange={setIsNeighborhoodEditOpen}
      >
        <DialogContent className="w-[500px] max-h-[80vh] mx-auto bg-white overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-xl text-teal-700">
              {selectedNeighborhood
                ? `Editar Barrio: ${selectedNeighborhood.name}`
                : "Editar Barrio"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedNeighborhood && (
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="font-medium text-gray-800 mb-2 text-sm flex items-center">
                  <MapPin className="h-3 w-3 mr-1 text-teal-600" />
                  Información del Barrio
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <ValidatedSelect
                    id="edit-neighborhood-commune"
                    label="Comuna"
                    value={updateNeighborhoodData.communeId}
                    onChange={(value) =>
                      handleUpdateNeighborhoodFieldChange("communeId", value)
                    }
                    options={allCommunes}
                    error={neighborhoodFormErrors.communeId}
                    placeholder="Seleccione comuna..."
                    required
                  />

                  <ValidatedInput
                    id="edit-neighborhood-name"
                    label="Nombre del Barrio"
                    value={updateNeighborhoodData.name}
                    onChange={(value) =>
                      handleUpdateNeighborhoodFieldChange("name", value)
                    }
                    error={neighborhoodFormErrors.name}
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-end gap-3 pt-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsNeighborhoodEditOpen(false);
                setSelectedNeighborhood(null);
                setNeighborhoodFormErrors({});
              }}
              className="px-4"
              size="sm"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              className="bg-teal-600 hover:bg-teal-700 px-4"
              size="sm"
              onClick={handleUpdateNeighborhood}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}