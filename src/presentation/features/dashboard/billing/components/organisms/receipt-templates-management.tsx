"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Plus, Loader2, FileText, Eye } from "lucide-react";
import { toast } from "sonner";
import { getReceiptTemplatesAction } from "@/infrastructure/web/controllers/dashboard/billing.actions";
import type { TemplatePlainObject } from "@/entities/billing/domain/TemplateEntity";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { ReceiptTemplateBuilder } from "./template-builder/receipt-template-builder";
import { TemplatePreviewModal } from "./template-preview-modal";

export function ReceiptTemplatesManagement() {
  const [templates, setTemplates] = useState<TemplatePlainObject[]>([]);
  const [loading, setLoading] = useState(false);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplatePlainObject | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TemplatePlainObject | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      console.log("Loading templates...");
      const result = await getReceiptTemplatesAction(false); // Get all templates, not just active
      console.log("Templates result:", result);
      if (result.success) {
        console.log("Templates data:", result.data);
        setTemplates(result.data);
      } else {
        console.error("Error loading templates:", result.error);
        toast.error("Error al cargar plantillas", {
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      toast.error("Error al cargar plantillas");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setBuilderOpen(true);
  };

  const handleEditTemplate = (template: TemplatePlainObject) => {
    setEditingTemplate(template);
    setBuilderOpen(true);
  };

  const handlePreviewTemplate = (template: TemplatePlainObject) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  const handleBuilderSuccess = () => {
    loadTemplates(); // Reload templates after save
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Plantillas de Recibos
          </h2>
          <p className="text-muted-foreground">
            Gestiona las plantillas para generar recibos de pago
          </p>
        </div>
        <Button onClick={handleCreateTemplate} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Crear nueva plantilla de recibo
        </Button>
      </div>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                Cargando plantillas...
              </span>
            </div>
          ) : templates.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No hay plantillas creadas. Cree una nueva plantilla para comenzar.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha de creación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.description || "—"}</TableCell>
                    <TableCell>
                      {template.isActive ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Activa
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          Inactiva
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(template.createdAt).toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreviewTemplate(template)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Visualizar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTemplate(template)}
                        >
                          Editar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Template Builder Modal */}
      <ReceiptTemplateBuilder
        open={builderOpen}
        onClose={() => {
          setBuilderOpen(false);
          setEditingTemplate(null);
        }}
        template={editingTemplate}
        onSuccess={handleBuilderSuccess}
      />

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewTemplate(null);
        }}
        template={previewTemplate}
      />
    </div>
  );
}
