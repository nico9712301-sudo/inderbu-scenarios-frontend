"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Eye, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { TemplatePlainObject } from "@/entities/billing/domain/TemplateEntity";
import type { TemplateContent } from "../template-builder/types/template-builder.types";
import { TemplatePreviewRenderer } from "./template-preview-renderer";

interface TemplatePreviewModalProps {
  open: boolean;
  onClose: () => void;
  template: TemplatePlainObject | null;
}

export function TemplatePreviewModal({
  open,
  onClose,
  template,
}: TemplatePreviewModalProps) {
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Parse template content
  const templateContent = useMemo<TemplateContent | null>(() => {
    if (!template?.content) return null;
    try {
      return JSON.parse(template.content);
    } catch (error) {
      console.error("Error parsing template content:", error);
      return null;
    }
  }, [template]);

  const handleDownloadPDF = async () => {
    if (!templateContent || !template) {
      toast.error("No se puede descargar el PDF");
      return;
    }

    setDownloading(true);
    try {
      // Dynamic import to avoid SSR issues
      const React = await import("react");
      const { pdf } = await import("@react-pdf/renderer");
      const { TemplatePDFDocument } = await import("./template-pdf-renderer");

      // Generate PDF blob using pdf() function
      const doc = pdf(
        React.createElement(TemplatePDFDocument, { content: templateContent })
      );
      
      const blob = await doc.toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `factura_${template.name.replace(/\s+/g, "_")}_preview.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("PDF descargado exitosamente");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Error al generar el PDF", {
        description: "No se pudo descargar el PDF. Intente nuevamente.",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visualizar Factura - {template?.name || "Plantilla"}
          </DialogTitle>
          <DialogDescription>
            Vista previa de la factura con datos ficticios
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto flex flex-col bg-gray-100 p-4">
          {!templateContent ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Eye className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                La plantilla no tiene contenido configurado o hay un error al parsearlo.
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex justify-end mb-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPDF}
                  disabled={downloading}
                  className="flex items-center gap-2"
                >
                  {downloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Descargar PDF
                </Button>
              </div>
              <div 
                ref={previewRef}
                className="flex-1 border rounded-lg overflow-auto bg-white shadow-inner"
              >
                <TemplatePreviewRenderer content={templateContent} />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
