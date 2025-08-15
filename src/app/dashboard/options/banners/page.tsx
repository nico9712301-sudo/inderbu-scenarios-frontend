"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  ArrowDown,
  ArrowUp,
  ImageIcon,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { SimpleLayout } from "@/shared/components/layout/simple-layout";
import { slides } from "@/shared/mock-data/slides";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useState } from "react";
import Image from "next/image";


export default function BannersPage() {
  const [activeTab, setActiveTab] = useState("home");
  const [banners, setBanners] = useState(slides);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEditBanner = (banner: any) => {
    setEditingBanner({ ...banner });
    setIsDialogOpen(true);
  };

  const handleSaveBanner = () => {
    if (editingBanner.id) {
      // Actualizar banner existente
      setBanners(
        banners.map((b) => (b.id === editingBanner.id ? editingBanner : b))
      );
    } else {
      // Crear nuevo banner
      const newId = Math.max(0, ...banners.map((b) => b.id)) + 1;
      setBanners([...banners, { ...editingBanner, id: newId }]);
    }
    setIsDialogOpen(false);
  };

  const handleDeleteBanner = (id: number) => {
    setBanners(banners.filter((b) => b.id !== id));
  };

  const handleMoveBanner = (id: number, direction: "up" | "down") => {
    const index = banners.findIndex((b) => b.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === banners.length - 1)
    ) {
      return;
    }

    const newBanners = [...banners];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;
    setBanners(newBanners);
  };

  const handleAddBanner = () => {
    setEditingBanner({
      id: null,
      title: "",
      description: "",
      imageUrl: "",
      buttonText: "",
      buttonLink: "",
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestión de Banners
          </h1>
          <p className="text-muted-foreground">
            Administra los banners que se muestran en las diferentes páginas.
          </p>
        </div>
        <Button onClick={handleAddBanner}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Banner
        </Button>
      </div>

      <Tabs
        defaultValue="home"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="home">Página Principal</TabsTrigger>
          <TabsTrigger value="escenarios">Escenarios</TabsTrigger>
          <TabsTrigger value="eventos">Eventos</TabsTrigger>
        </TabsList>

        <TabsContent value="home" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Banners de la Página Principal</CardTitle>
              <CardDescription>
                Estos banners se muestran en el carrusel de la página principal.
                Se recomienda usar imágenes de 1920x600 píxeles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {banners.map((banner) => (
                  <Card key={banner.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="relative w-full md:w-1/3 h-48">
                        <Image
                          src={banner.imageUrl || "/placeholder.svg"}
                          alt={banner.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {banner.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {banner.description}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                Botón: {banner.buttonText}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Enlace: {banner.buttonLink}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMoveBanner(banner.id, "up")}
                              disabled={banners.indexOf(banner) === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleMoveBanner(banner.id, "down")
                              }
                              disabled={
                                banners.indexOf(banner) === banners.length - 1
                              }
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditBanner(banner)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteBanner(banner.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Banners de Escenarios</CardTitle>
              <CardDescription>
                Estos banners se muestran en la página de escenarios. Aún no hay
                banners configurados para esta sección.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  No hay banners
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comienza añadiendo un nuevo banner para esta sección.
                </p>
                <div className="mt-6">
                  <Button onClick={handleAddBanner}>
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir banner
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eventos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Banners de Eventos</CardTitle>
              <CardDescription>
                Estos banners se muestran en la página de eventos. Aún no hay
                banners configurados para esta sección.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                  No hay banners
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Comienza añadiendo un nuevo banner para esta sección.
                </p>
                <div className="mt-6">
                  <Button onClick={handleAddBanner}>
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir banner
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingBanner?.id ? "Editar Banner" : "Nuevo Banner"}
            </DialogTitle>
            <DialogDescription>
              Completa los campos para{" "}
              {editingBanner?.id ? "actualizar el" : "crear un nuevo"} banner.
            </DialogDescription>
          </DialogHeader>
          {editingBanner && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Título
                </Label>
                <Input
                  id="title"
                  value={editingBanner.title}
                  onChange={(e) =>
                    setEditingBanner({
                      ...editingBanner,
                      title: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  value={editingBanner.description}
                  onChange={(e) =>
                    setEditingBanner({
                      ...editingBanner,
                      description: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right">
                  URL de Imagen
                </Label>
                <Input
                  id="imageUrl"
                  value={editingBanner.imageUrl}
                  onChange={(e) =>
                    setEditingBanner({
                      ...editingBanner,
                      imageUrl: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="buttonText" className="text-right">
                  Texto del Botón
                </Label>
                <Input
                  id="buttonText"
                  value={editingBanner.buttonText}
                  onChange={(e) =>
                    setEditingBanner({
                      ...editingBanner,
                      buttonText: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="buttonLink" className="text-right">
                  Enlace del Botón
                </Label>
                <Input
                  id="buttonLink"
                  value={editingBanner.buttonLink}
                  onChange={(e) =>
                    setEditingBanner({
                      ...editingBanner,
                      buttonLink: e.target.value,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              {editingBanner.imageUrl && (
                <div className="mt-2">
                  <Label>Vista previa</Label>
                  <div className="mt-2 relative h-40 w-full overflow-hidden rounded-md">
                    <Image
                      src={editingBanner.imageUrl || "/placeholder.svg"}
                      alt="Vista previa"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveBanner}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
