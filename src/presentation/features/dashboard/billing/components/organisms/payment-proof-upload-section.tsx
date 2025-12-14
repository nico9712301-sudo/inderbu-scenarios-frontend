"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, FileText, AlertTriangle, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { toast } from "sonner";
import { uploadPaymentProofAction } from "@/infrastructure/web/controllers/dashboard/payment-proof.actions";
import type { ReservationDto } from "@/entities/reservation/model/types";
import type { PaymentProofPlainObject } from "@/entities/billing/domain/PaymentProofEntity";
// Import will be done dynamically to avoid circular dependency

interface PaymentProofUploadSectionProps {
  reservation: ReservationDto;
  userId: number;
  onUploadSuccess?: () => void;
}

export function PaymentProofUploadSection({
  reservation,
  userId,
  onUploadSuccess,
}: PaymentProofUploadSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [paymentProofs, setPaymentProofs] = useState<PaymentProofPlainObject[]>([]);
  const [loadingProofs, setLoadingProofs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPending = reservation.reservationState?.state === 'PENDIENTE' ||
                   reservation.reservationStateId === 1;

  const shouldShowUpload = (reservation.subScenario?.hasCost ?? false) && isPending;

  // Load existing payment proofs
  useEffect(() => {
    if (shouldShowUpload) {
      loadPaymentProofs();
    }
  }, [reservation.id, shouldShowUpload]);

  const loadPaymentProofs = async () => {
    setLoadingProofs(true);
    try {
      const { getPaymentProofsByReservationAction } = await import("@/infrastructure/web/controllers/dashboard/payment-proof.actions");
      const result = await getPaymentProofsByReservationAction(reservation.id);
      if (result.success) {
        setPaymentProofs(result.data);
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
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Seleccione un archivo");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('reservationId', reservation.id.toString());
      formData.append('uploadedByUserId', userId.toString());

      const { uploadPaymentProofAction } = await import("@/infrastructure/web/controllers/dashboard/payment-proof.actions");
      const result = await uploadPaymentProofAction(formData);

      if (result.success) {
        toast.success("Comprobante de pago subido exitosamente", {
          description: "El comprobante ha sido enviado y será revisado por los administradores.",
        });
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        await loadPaymentProofs();
        onUploadSuccess?.();
      } else {
        toast.error("Error al subir comprobante", {
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Error uploading payment proof:", error);
      toast.error("Error al subir comprobante de pago");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!shouldShowUpload) {
    return null;
  }

  return (
    <Card className="mt-4 border-yellow-200 bg-yellow-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-yellow-700" />
          Comprobante de Pago
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Warning Message */}
        <Alert className="bg-yellow-100 border-yellow-300">
          <AlertTriangle className="h-4 w-4 text-yellow-700" />
          <AlertDescription className="text-yellow-800">
            <strong>Importante:</strong> Si no subes el comprobante de pago en las próximas 24 horas, 
            tu reserva podría ser cancelada.
          </AlertDescription>
        </Alert>

        {/* Upload Zone */}
        <div className="border-2 border-dashed border-yellow-300 rounded-lg p-6 text-center hover:border-yellow-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            className="hidden"
            id={`payment-proof-${reservation.id}`}
          />
          
          {!file ? (
            <label
              htmlFor={`payment-proof-${reservation.id}`}
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className="h-8 w-8 text-yellow-600 mb-2" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Haz clic para seleccionar un archivo
              </p>
              <p className="text-xs text-gray-500">
                PDF, JPG, JPEG o PNG (máximo 10MB)
              </p>
            </label>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {uploading ? "Subiendo..." : "Subir"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Existing Payment Proofs */}
        {paymentProofs.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              Comprobantes subidos ({paymentProofs.length})
            </p>
            {paymentProofs.map((proof) => (
              <div
                key={proof.id}
                className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-700">
                    {proof.originalFileName}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({new Date(proof.createdAt).toLocaleDateString("es-ES")})
                  </span>
                </div>
                <a
                  href={proof.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Ver
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
