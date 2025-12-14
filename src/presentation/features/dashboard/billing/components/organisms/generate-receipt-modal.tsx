"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { generateReceiptAction } from "@/infrastructure/web/controllers/dashboard/billing.actions";
import { getSubScenarioPriceAction } from "@/infrastructure/web/controllers/dashboard/sub-scenario-price.actions";
import type { ReservationDto } from "@/entities/reservation/model/types";
import type { TemplatePlainObject } from "@/entities/billing/domain/TemplateEntity";
import type { TemplateContent } from "./template-builder/types/template-builder.types";
import { TemplatePreviewRenderer } from "./template-preview-renderer";
import { TemplateSearchCombobox } from "../molecules/template-search-combobox";

interface GenerateReceiptModalProps {
  open: boolean;
  onClose: () => void;
  reservation: ReservationDto | null;
  onSuccess?: () => void;
}

export function GenerateReceiptModal({
  open,
  onClose,
  reservation,
  onSuccess,
}: GenerateReceiptModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [hourlyPrice, setHourlyPrice] = useState<number>(5000);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplatePlainObject | null>(null);

  // Calculate total hours from timeslots
  const totalHours = useMemo(() => {
    if (!reservation) return 0;

    const timeslots = reservation.timeslots || [];
    if (timeslots.length === 0) return 0;

    let totalHours = 0;

    // Calculate hours for each timeslot
    timeslots.forEach((slot) => {
      const startTime = slot.startTime.split(":").map(Number);
      const endTime = slot.endTime.split(":").map(Number);
      
      const startMinutes = startTime[0] * 60 + startTime[1];
      const endMinutes = endTime[0] * 60 + endTime[1];
      
      const hours = (endMinutes - startMinutes) / 60;
      totalHours += hours;
    });

    // If it's a RANGE reservation, multiply by totalInstances
    if (reservation.type === "RANGE" && reservation.totalInstances > 1) {
      totalHours *= reservation.totalInstances;
    }

    return Math.ceil(totalHours); // Round up to nearest hour
  }, [reservation]);

  // Load price when modal opens
  useEffect(() => {
    if (open && reservation) {
      loadSubScenarioPrice();
    } else {
      // Reset state when modal closes
      setSelectedTemplateId(null);
      setSelectedTemplate(null);
    }
  }, [open, reservation]);

  // Update total amount when hourly price or hours change (only if totalAmount hasn't been manually edited)
  // We'll track if total was manually edited
  const [totalManuallyEdited, setTotalManuallyEdited] = useState(false);
  
  useEffect(() => {
    if (!totalManuallyEdited) {
      setTotalAmount(hourlyPrice * totalHours);
    }
  }, [hourlyPrice, totalHours, totalManuallyEdited]);

  // Load template details when ID changes
  useEffect(() => {
    const loadTemplateDetails = async () => {
      if (selectedTemplateId && !selectedTemplate) {
        try {
          const { getReceiptTemplatesAction } = await import("@/infrastructure/web/controllers/dashboard/billing.actions");
          const result = await getReceiptTemplatesAction(true);
          if (result.success) {
            const template = result.data?.find((t) => t.id === selectedTemplateId);
            if (template) {
              setSelectedTemplate(template);
            }
          }
        } catch (error) {
          console.error("Error loading template details:", error);
        }
      }
    };
    loadTemplateDetails();
  }, [selectedTemplateId, selectedTemplate]);

  const loadSubScenarioPrice = async () => {
    if (!reservation) return;

    setLoadingPrice(true);
    try {
      const result = await getSubScenarioPriceAction(reservation.subScenarioId);
      // Handle ErrorHandlerResult format
      if (result && typeof result === 'object') {
        if ('success' in result && result.success && 'data' in result && result.data) {
          const price = result.data;
          if (price && typeof price === 'object' && 'hourlyPrice' in price) {
            const hourlyPriceValue = (price as { hourlyPrice: number }).hourlyPrice;
            if (typeof hourlyPriceValue === 'number' && hourlyPriceValue > 0) {
              setHourlyPrice(hourlyPriceValue);
              return;
            }
          }
        } else if ('hourlyPrice' in result) {
          // Direct SubScenarioPriceEntity format
          const hourlyPriceValue = (result as { hourlyPrice: number }).hourlyPrice;
          if (typeof hourlyPriceValue === 'number' && hourlyPriceValue > 0) {
            setHourlyPrice(hourlyPriceValue);
            return;
          }
        }
      }
      // Default to 5000 if no price found
      setHourlyPrice(5000);
    } catch (error) {
      console.error("Error loading sub-scenario price:", error);
      // Default to 5000 on error
      setHourlyPrice(5000);
    } finally {
      setLoadingPrice(false);
    }
  };

  const templateContent = useMemo<TemplateContent | null>(() => {
    if (!selectedTemplate?.content) return null;
    try {
      return JSON.parse(selectedTemplate.content);
    } catch (error) {
      console.error("Error parsing template content:", error);
      return null;
    }
  }, [selectedTemplate]);


  const handleGenerate = async () => {
    if (!reservation || !selectedTemplateId) {
      toast.error("Seleccione una plantilla");
      return;
    }

    const hasCost = reservation.subScenario?.hasCost ?? false;
    if (!hasCost) {
      toast.error("No se puede generar recibo", {
        description: "Esta reserva es para un sub-escenario gratuito. Solo se pueden generar recibos para reservas con costo.",
      });
      return;
    }

    // Validate hourlyPrice minimum
    if (hourlyPrice < 1000) {
      toast.error("Precio por hora inválido", {
        description: "El precio por hora debe ser al menos 1000 pesos.",
      });
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        reservationId: reservation.id,
        templateId: selectedTemplateId,
        customerEmail: reservation.user?.email,
        hourlyPrice: hourlyPrice,
        totalCost: totalAmount,
      };
      console.log('[GenerateReceiptModal] Calling generateReceiptAction with:', requestData);

      const result = await generateReceiptAction(requestData);
      console.log('[GenerateReceiptModal] Action result:', result);

      if (result.success) {
        toast.success("Recibo generado exitosamente", {
          description: "El recibo ha sido generado y está disponible para descargar.",
        });
        onSuccess?.();
        onClose();
      } else {
        let errorMessage = result.error || "Error desconocido";
        if (errorMessage.includes("sub-escenarios gratuitos") || errorMessage.includes("gratuitos")) {
          errorMessage = "No se puede generar recibo para sub-escenarios gratuitos. Esta reserva no tiene costo asociado.";
        }
        
        toast.error("Error al generar recibo", {
          description: errorMessage,
        });
      }
    } catch (error) {
      console.error('[GenerateReceiptModal] Exception caught:', error);
      
      let errorMessage = "Error desconocido";
      if (error instanceof Error) {
        errorMessage = error.message;
        if (errorMessage.includes("sub-escenarios gratuitos") || errorMessage.includes("gratuitos")) {
          errorMessage = "No se puede generar recibo para sub-escenarios gratuitos. Esta reserva no tiene costo asociado.";
        }
      }
      
      toast.error("Error al generar recibo", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!reservation) return null;

  const hasCost = reservation.subScenario?.hasCost ?? false;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Generar Recibo</DialogTitle>
          <DialogDescription>
            Seleccione una plantilla para la reserva #${reservation.id}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          <div className="space-y-2">
            <Label>Plantilla de Recibo</Label>
            <TemplateSearchCombobox
              value={selectedTemplateId}
              onValueChange={(templateId, template) => {
                setSelectedTemplateId(templateId);
                setSelectedTemplate(template || null);
              }}
              placeholder="Buscar plantilla..."
              disabled={loading}
            />
          </div>

          {/* Preview */}
          {selectedTemplateId && selectedTemplate && templateContent && (
            <div className="space-y-4">
              <div>
                <Label>Vista Previa</Label>
              </div>
              <div className="border rounded-lg overflow-auto bg-white shadow-inner max-h-[300px]">
                <div className="p-4">
                  <TemplatePreviewRenderer 
                    content={templateContent}
                    hourlyPrice={hourlyPrice}
                    totalAmount={totalAmount}
                    totalHours={totalHours}
                    onHourlyPriceChange={(value) => {
                      setHourlyPrice(value);
                      // Reset manual edit flag when hourly price changes
                      setTotalManuallyEdited(false);
                    }}
                    onTotalAmountChange={setTotalAmount}
                    onTotalManuallyEdited={setTotalManuallyEdited}
                  />
                </div>
              </div>

              {/* Warning for free sub-scenarios */}
              {!hasCost && (
                <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
                  <p className="text-sm font-medium text-yellow-800">
                    ⚠️ Advertencia
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Esta reserva es para un sub-escenario gratuito. El backend puede rechazar la generación del recibo.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={loading || !selectedTemplateId}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              "Generar Recibo"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

    </Dialog>
  );
}
