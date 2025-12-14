"use client";

import { useState, useEffect, useRef } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";
import type { ReservationDto } from "@/entities/reservation/model/types";
// Import will be done dynamically

interface ConfirmPaidReservationModalProps {
  open: boolean;
  onClose: () => void;
  reservation: ReservationDto | null;
  onConfirm: (data: { justification?: string; paymentProofFile?: File }) => void;
}

export function ConfirmPaidReservationModal({
  open,
  onClose,
  reservation,
  onConfirm,
}: ConfirmPaidReservationModalProps) {
  const [hasPaymentProofs, setHasPaymentProofs] = useState(false);
  const [loadingProofs, setLoadingProofs] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'upload' | 'justify' | null>(null);
  const [justification, setJustification] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load payment proofs when modal opens
  useEffect(() => {
    if (open && reservation) {
      loadPaymentProofs();
    }
  }, [open, reservation]);

  const loadPaymentProofs = async () => {
    if (!reservation) return;

    setLoadingProofs(true);
    try {
      const { getPaymentProofsByReservationAction } = await import("@/infrastructure/web/controllers/dashboard/payment-proof.actions");
      const result = await getPaymentProofsByReservationAction(reservation.id);
      if (result.success) {
        setHasPaymentProofs(result.data.length > 0);
        
        // If has payment proofs, confirm directly
        if (result.data.length > 0) {
          onConfirm({});
          onClose();
        }
      }
    } catch (error) {
      console.error("Error loading payment proofs:", error);
    } finally {
      setLoadingProofs(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Tipo de archivo no permitido", {
        description: "Solo se permiten archivos PDF, JPG, JPEG o PNG.",
      });
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      toast.error("Archivo demasiado grande", {
        description: "El archivo no puede exceder 10MB.",
      });
      return;
    }

    setFile(selectedFile);
    setSelectedOption('upload');
  };

  const handleConfirm = () => {
    if (selectedOption === 'upload' && !file) {
      toast.error("Seleccione un archivo");
      return;
    }

    if (selectedOption === 'justify' && !justification.trim()) {
      toast.error("La justificación es requerida");
      return;
    }

    onConfirm({
      justification: selectedOption === 'justify' ? justification : undefined,
      paymentProofFile: selectedOption === 'upload' ? file || undefined : undefined,
    });
    onClose();
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSelectedOption(null);
  };

  if (!reservation || loadingProofs) {
    return null;
  }

  // If has payment proofs, don't show modal (already confirmed)
  if (hasPaymentProofs) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Reserva de Pago</AlertDialogTitle>
          <AlertDialogDescription>
            Esta reserva requiere comprobante de pago. Seleccione una opción:
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          {/* Option 1: Upload Payment Proof */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="option-upload"
                name="confirm-option"
                checked={selectedOption === 'upload'}
                onChange={() => setSelectedOption('upload')}
                className="h-4 w-4"
              />
              <Label htmlFor="option-upload" className="font-medium cursor-pointer">
                Subir comprobante de pago manualmente
              </Label>
            </div>

            {selectedOption === 'upload' && (
              <div className="ml-6 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="payment-proof-file"
                />
                
                {!file ? (
                  <label
                    htmlFor="payment-proof-file"
                    className="flex items-center gap-2 p-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
                  >
                    <Upload className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Seleccionar archivo (PDF, JPG, PNG - máx. 10MB)
                    </span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Option 2: Confirm without proof (requires justification) */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="option-justify"
                name="confirm-option"
                checked={selectedOption === 'justify'}
                onChange={() => setSelectedOption('justify')}
                className="h-4 w-4"
              />
              <Label htmlFor="option-justify" className="font-medium cursor-pointer">
                Confirmar sin comprobante
              </Label>
            </div>

            {selectedOption === 'justify' && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="justification" className="text-sm font-medium">
                  Razón por la cual no se adjunta comprobante *
                </Label>
                <Textarea
                  id="justification"
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Ej: El cliente pagó en efectivo y no tiene comprobante..."
                  className="min-h-[100px]"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {justification.length}/500 caracteres
                </p>
              </div>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedOption || (selectedOption === 'upload' && !file) || (selectedOption === 'justify' && !justification.trim())}
          >
            Confirmar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
