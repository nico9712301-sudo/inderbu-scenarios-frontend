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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Badge } from "@/shared/ui/badge";
import { Download, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";
import { getReceiptsByReservationAction } from "@/infrastructure/web/controllers/dashboard/billing.actions";
import type { ReservationDto } from "@/entities/reservation/model/types";
import type { ReceiptPlainObject } from "@/entities/billing/domain/ReceiptEntity";
import type { TemplateContent } from "./template-builder/types/template-builder.types";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { ReceiptRenderer } from "./receipt-renderer";

interface ReceiptsHistoryModalProps {
  open: boolean;
  onClose: () => void;
  reservation: ReservationDto | null;
}

export function ReceiptsHistoryModal({
  open,
  onClose,
  reservation,
}: ReceiptsHistoryModalProps) {
  const [receipts, setReceipts] = useState<ReceiptPlainObject[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptPlainObject | null>(null);
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load receipts when modal opens
  useEffect(() => {
    if (open && reservation) {
      loadReceipts();
      setSelectedReceipt(null);
    }
  }, [open, reservation]);

  const loadReceipts = async () => {
    if (!reservation) return;

    setLoading(true);
    try {
      const result = await getReceiptsByReservationAction(reservation.id);
      if (result.success) {
        setReceipts(result.data);
      } else {
        toast.error("Error al cargar recibos", {
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Error loading receipts:", error);
      toast.error("Error al cargar recibos");
    } finally {
      setLoading(false);
    }
  };

  // Parse template content from selected receipt
  const templateContent = useMemo<TemplateContent | null>(() => {
    if (!selectedReceipt?.templateContent) return null;
    try {
      return JSON.parse(selectedReceipt.templateContent);
    } catch (error) {
      console.error("Error parsing template content:", error);
      return null;
    }
  }, [selectedReceipt]);

  const handleDownloadPDF = async () => {
    if (!templateContent || !selectedReceipt || !reservation) {
      toast.error("No se puede descargar el PDF");
      return;
    }

    setDownloading(true);
    try {
      // Dynamic import to avoid SSR issues
      const React = await import("react");
      const { pdf } = await import("@react-pdf/renderer");
      const { ReceiptPDFDocument } = await import("./receipt-pdf-renderer");

      // Generate PDF blob using pdf() function
      const doc = pdf(
        React.createElement(ReceiptPDFDocument, { 
          receipt: selectedReceipt,
          reservation: reservation,
          content: templateContent 
        })
      );
      
      const blob = await doc.toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recibo_${selectedReceipt.id}_${selectedReceipt.templateName?.replace(/\s+/g, "_") || "factura"}.pdf`;
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

  if (!reservation) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Historial de Recibos</DialogTitle>
          <DialogDescription>
            Recibos generados para la reserva #{reservation.id}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">
                Cargando recibos...
              </span>
            </div>
          ) : receipts.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No se han generado recibos para esta reserva.
              </p>
            </div>
          ) : !selectedReceipt ? (
            <div className="py-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha de generación</TableHead>
                    <TableHead>Plantilla usada</TableHead>
                    <TableHead>Enviado por email</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell>
                        {format(new Date(receipt.generatedAt), "dd MMM yyyy, HH:mm", {
                          locale: es,
                        })}
                      </TableCell>
                      <TableCell>{receipt.templateName || "N/A"}</TableCell>
                      <TableCell>
                        {receipt.isSent ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Sí
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            No
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReceipt(receipt)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col h-full bg-gray-100 p-4">
              <div className="flex justify-between items-center mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedReceipt(null)}
                >
                  ← Volver a la lista
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPDF}
                    disabled={downloading || !templateContent}
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
              </div>
              <div 
                ref={previewRef}
                className="flex-1 border rounded-lg overflow-auto bg-white shadow-inner"
              >
                {!templateContent ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Eye className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      La plantilla no tiene contenido configurado o hay un error al parsearlo.
                    </p>
                  </div>
                ) : (
                  <ReceiptRenderer 
                    receipt={selectedReceipt}
                    reservation={reservation}
                    content={templateContent}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
