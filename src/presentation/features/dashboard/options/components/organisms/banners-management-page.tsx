"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Plus,
  Edit,
  MoreHorizontal,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import {
  homeSlidesService,
  HomeSlide,
  HomeSlideType,
  CreateHomeSlideRequest,
  UpdateHomeSlideRequest,
} from "@/shared/api/home-slides";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { modulesService, Module, EntityType } from "@/shared/api/modules";
import { normalizeImageUrl } from "@/shared/utils/image-url.utils";
import { Textarea } from "@/shared/ui/textarea";
import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Badge } from "@/shared/ui/badge";
import { toast } from "sonner";
import Image from "next/image";


interface SlideFormData {
  title: string;
  description: string;
  imageUrl: string;
  slideType: HomeSlideType;
  displayOrder: number;
  moduleId?: number;
  entityId?: number;
}

const defaultFormData: SlideFormData = {
  title: "",
  description: "",
  imageUrl: "",
  slideType: HomeSlideType.BANNER,
  displayOrder: 0,
  moduleId: undefined,
  entityId: undefined,
};

export function BannersManagementPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<SlideFormData>(defaultFormData);
  const [editingSlide, setEditingSlide] = useState<HomeSlide | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const queryClient = useQueryClient();

  // Fetch slides
  const {
    data: slides = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["home-slides"],
    queryFn: () => homeSlidesService.getHomeSlides(),
  });

  // Fetch modules
  const {
    data: modules = [],
    isLoading: isLoadingModules,
  } = useQuery({
    queryKey: ["modules"],
    queryFn: () => modulesService.getModules(),
  });

  // Fetch entities
  const {
    data: entities = [],
    isLoading: isLoadingEntities,
  } = useQuery({
    queryKey: ["entities"],
    queryFn: () => modulesService.getEntities(),
  });

  // Create slide mutation
  const createSlideMutation = useMutation({
    mutationFn: (data: CreateHomeSlideRequest) =>
      homeSlidesService.createHomeSlide(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-slides"] });
      setIsCreateDialogOpen(false);
      setFormData(defaultFormData);
      setImagePreview("");
      toast.success("Banner creado exitosamente");
    },
    onError: (error) => {
      toast.error(`Error al crear banner: ${error.message}`);
    },
  });

  // Update slide mutation
  const updateSlideMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHomeSlideRequest }) =>
      homeSlidesService.updateHomeSlide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-slides"] });
      setIsEditDialogOpen(false);
      setEditingSlide(null);
      setFormData(defaultFormData);
      setImagePreview("");
      toast.success("Banner actualizado exitosamente");
    },
    onError: (error) => {
      toast.error(`Error al actualizar banner: ${error.message}`);
    },
  });

  // Toggle slide status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: (id: number) => homeSlidesService.toggleSlideStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-slides"] });
      toast.success("Estado del banner actualizado");
    },
    onError: (error) => {
      toast.error(`Error al cambiar estado: ${error.message}`);
    },
  });

  // Delete slide mutation
  const deleteSlideMutation = useMutation({
    mutationFn: (id: number) => homeSlidesService.deleteHomeSlide(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["home-slides"] });
      toast.success("Banner eliminado exitosamente");
    },
    onError: (error) => {
      toast.error(`Error al eliminar banner: ${error.message}`);
    },
  });

  // Handle form input changes
  const handleInputChange = (field: keyof SlideFormData, value: string | number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Update image preview when imageUrl changes
    if (field === "imageUrl" && typeof value === "string") {
      setImagePreview(value.includes("http") ? value : `http://localhost:3001${value}`);
    }

    // Reset dependent fields when slideType changes
    if (field === "slideType") {
      setFormData((prev) => ({
        ...prev,
        slideType: value as HomeSlideType,
        moduleId: undefined,
        entityId: undefined,
        description: value === HomeSlideType.PLACEHOLDER ? "" : prev.description,
      }));
    }
  };

  // Handle create submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      toast.error("Título e imagen son requeridos");
      return;
    }

    createSlideMutation.mutate({
      title: formData.title,
      description: "",
      imageUrl: formData.imageUrl,
      slideType: HomeSlideType.BANNER.toString().toLowerCase() as HomeSlideType,
      displayOrder: formData.displayOrder,
      moduleId: formData.moduleId,
    });
  };

  // Handle edit submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;

    if (!formData.title || !formData.imageUrl) {
      toast.error("Título e imagen son requeridos");
      return;
    }

    updateSlideMutation.mutate({
      id: editingSlide.id,
      data: {
        title: formData.title,
        description: "",
        imageUrl: formData.imageUrl,
        slideType: HomeSlideType.BANNER.toString().toLowerCase() as HomeSlideType,
        displayOrder: formData.displayOrder,
        moduleId: formData.moduleId,
        entityId: formData.entityId,
      },
    });
  };

  // Handle edit dialog open
  const handleEditOpen = (slide: HomeSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      description: slide.description || "",
      imageUrl: slide.imageUrl,
      slideType: slide.slideType,
      displayOrder: slide.displayOrder,
      moduleId: slide.moduleId || undefined,
      entityId: slide.entityId || undefined,
    });
    setImagePreview(slide.imageUrl.includes("http") ? slide.imageUrl : `http://localhost:3001${slide.imageUrl}`);
    setIsEditDialogOpen(true);
  };

  // Handle delete
  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este banner?")) {
      deleteSlideMutation.mutate(id);
    }
  };

  console.log({ slides, isLoading, error });
  

  // Sort slides by display order
  const sortedSlides: HomeSlide[] = [...slides].sort((a, b) => a.displayOrder - b.displayOrder);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-muted-foreground">Cargando banners...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-red-500">Error al cargar banners</p>
      </div>
    );
  }

  console.log({formData});
  

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Banners del Sistema</h2>
          <p className="text-sm text-muted-foreground">
            Gestiona los banners que aparecen en la página principal
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Banner</DialogTitle>
              <DialogDescription>
                Crea un nuevo banner para mostrar en la página principal
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-title">Título *</Label>
                  <Input
                    id="create-title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Título del banner"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="create-imageUrl">URL de Imagen *</Label>
                <Input
                  id="create-imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  type="url"
                  required
                />
              </div>

              {imagePreview && (
                <div className="space-y-2">
                  <Label>Vista Previa</Label>
                  <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Vista previa"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-displayOrder">Orden</Label>
                  <Input
                    id="create-displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => handleInputChange("displayOrder", parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createSlideMutation.isPending}>
                  {createSlideMutation.isPending ? "Creando..." : "Crear Banner"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Slides Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Orden</TableHead>
              <TableHead className="w-[100px]">Imagen</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSlides.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No hay banners creados</p>
                    <p className="text-sm text-muted-foreground">
                      Crea tu primer banner para comenzar
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedSlides.map((slide) => (
                <TableRow key={slide.id}>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{slide.displayOrder}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="relative w-16 h-10 border rounded overflow-hidden">
                      <Image
                        src={normalizeImageUrl(slide.imageUrl)}
                        alt={slide.title}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{slide.title}</p>
                      {slide.description && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {slide.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={slide.isActive}
                        onCheckedChange={() => toggleStatusMutation.mutate(slide.id)}
                        disabled={toggleStatusMutation.isPending}
                      />
                      {slide.isActive ? (
                        <Eye className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {slide.imageUrl && (
                          <DropdownMenuItem asChild>
                            <a href={slide.imageUrl.includes("http") ? slide.imageUrl : `http://localhost:3001${slide.imageUrl}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Ver Enlace
                            </a>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleEditOpen(slide)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(slide.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Banner</DialogTitle>
            <DialogDescription>
              Actualiza la información del banner
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Título del banner"
                  required
                />
              </div>
            </div>

            {/* Conditional Fields Based on Type */}
            {formData.slideType === HomeSlideType.BANNER && (
              <div className="space-y-2">
                <Label htmlFor="edit-moduleId">Ubicación *</Label>
                <Select
                  value={formData.moduleId?.toString() || ""}
                  onValueChange={(value) => handleInputChange("moduleId", value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una ubicación" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
                      <SelectItem key={module.id} value={module.id.toString()}>
                        {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.slideType === HomeSlideType.PLACEHOLDER && (
              <div className="space-y-2">
                <Label htmlFor="edit-entityId">Entidad *</Label>
                <Select
                  value={formData.entityId?.toString() || ""}
                  onValueChange={(value) => handleInputChange("entityId", value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una entidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {entities.map((entity) => (
                      <SelectItem key={entity.id} value={entity.id.toString()}>
                        {entity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Description - Only for Banners */}
            {formData.slideType === HomeSlideType.BANNER && (
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Descripción del banner"
                  rows={3}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit-imageUrl">URL de Imagen *</Label>
              <Input
                id="edit-imageUrl"
                value={formData.imageUrl}
                onChange={(e) => handleInputChange("imageUrl", e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                type="text"
                required
              />
            </div>

            {imagePreview && (
              <div className="space-y-2">
                <Label>Vista Previa</Label>
                <div className="relative w-full h-32 border rounded-lg overflow-hidden">
                  <Image
                    src={imagePreview}
                    alt="Vista previa"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-displayOrder">Orden</Label>
                <Input
                  id="edit-displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => handleInputChange("displayOrder", parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateSlideMutation.isPending}>
                {updateSlideMutation.isPending ? "Actualizando..." : "Actualizar Banner"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}