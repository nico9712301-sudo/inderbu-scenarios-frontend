"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Download, Loader2, FileText, ImageIcon, User, Shield } from "lucide-react";
import { toast } from "sonner";
import { getPaymentProofsByReservationAction } from "@/infrastructure/web/controllers/dashboard/payment-proof.actions";
import type { ReservationDto } from "@/entities/reservation/model/types";
import type { PaymentProofPlainObject } from "@/entities/billing/domain/PaymentProofEntity";
import { Separator } from "@/shared/ui/separator";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";

interface PaymentProofsModalProps {
  open: boolean;
  onClose: () => void;
  reservation: ReservationDto | null;
}

interface PaymentProofWithUser extends PaymentProofPlainObject {
  uploadedByUser?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role?: {
      id: number;
      name: string;
    } | null;
  };
}

// Component for rendering individual payment proof card
function PaymentProofCard({ 
  proof, 
  onDownload, 
  safeFormatDate 
}: { 
  proof: PaymentProofWithUser; 
  onDownload: (proof: PaymentProofWithUser) => void;
  safeFormatDate: (date: Date | string | null | undefined) => string;
}) {
  const isImage = proof.mimeType?.startsWith('image/');
  const isPdf = proof.mimeType === 'application/pdf';
  const [imageError, setImageError] = useState(false);

  return (
    <div className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      {/* Preview/Icon */}
      <div className="flex-shrink-0">
        {isImage && proof.fileUrl && !imageError ? (
          <div className="w-24 h-24 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
            <img 
              src={proof.fileUrl} 
              alt={proof.originalFileName || `Comprobante ${proof.id}`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
            {isPdf ? (
              <FileText className="h-10 w-10 text-red-500" />
            ) : (
              <ImageIcon className="h-10 w-10 text-gray-400" />
            )}
          </div>
        )}
      </div>
      
      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {proof.originalFileName || `Comprobante ${proof.id}`}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Subido el {safeFormatDate(proof.createdAt)}
              {proof.fileSize && (
                <span> • {(proof.fileSize / 1024 / 1024).toFixed(2)} MB</span>
              )}
            </p>
            {proof.uploadedByUser && (
              <p className="text-xs text-gray-500 mt-1">
                Por: {proof.uploadedByUser.firstName} {proof.uploadedByUser.lastName}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(proof)}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <Download className="h-4 w-4" />
            Descargar
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PaymentProofsModal({
  open,
  onClose,
  reservation,
}: PaymentProofsModalProps) {
  const [paymentProofs, setPaymentProofs] = useState<PaymentProofWithUser[]>([]);
  const [loading, setLoading] = useState(false);

  // Load payment proofs when modal opens
  useEffect(() => {
    if (open && reservation) {
      loadPaymentProofs();
    }
  }, [open, reservation]);

  const loadPaymentProofs = async () => {
    if (!reservation) return;

    setLoading(true);
    try {
      const result = await getPaymentProofsByReservationAction(reservation.id);
      if (result.success) {
        // Sort by most recent first and get only the latest one
        const sorted = (result.data || []).sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        // Only keep the latest payment proof
        setPaymentProofs(sorted.length > 0 ? [sorted[0]] : []);
      } else {
        toast.error("Error al cargar comprobantes", {
          description: result.error,
        });
      }
    } catch (error) {
      console.error("Error loading payment proofs:", error);
      toast.error("Error al cargar comprobantes");
    } finally {
      setLoading(false);
    }
  };

  // Get the latest payment proof (should only be one after filtering)
  const latestProof = paymentProofs.length > 0 ? paymentProofs[0] : null;
  
  // Determine if it's from user or admin
  const isUserProof = latestProof ? (
    latestProof.uploadedByUser?.role 
      ? latestProof.uploadedByUser.role.id !== 1 
      : latestProof.uploadedBy === reservation?.userId
  ) : false;
  
  const isAdminProof = latestProof ? (
    latestProof.uploadedByUser?.role 
      ? latestProof.uploadedByUser.role.id === 1 
      : latestProof.uploadedBy !== reservation?.userId
  ) : false;

  const handleDownload = (proof: PaymentProofWithUser) => {
    if (!proof.fileUrl) {
      toast.error("URL del comprobante no disponible");
      return;
    }

    const link = document.createElement('a');
    link.href = proof.fileUrl;
    link.download = proof.originalFileName || `comprobante_${proof.id}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Iniciando descarga del comprobante");
  };

  const safeFormatDate = (dateValue: Date | string | null | undefined): string => {
    try {
      if (!dateValue) return "Fecha no disponible";
      
      let date: Date;
      if (dateValue instanceof Date) {
        date = dateValue;
      } else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      } else {
        date = new Date(dateValue);
      }
      
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }
      
      return format(date, "dd/MM/yyyy HH:mm", { locale: es });
    } catch (error) {
      console.error("Error formatting date:", error, dateValue);
      return "Fecha no disponible";
    }
  };


  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Comprobantes de Pago
          </DialogTitle>
          <DialogDescription>
            {reservation && (
              <>Comprobantes de pago para la reserva #{reservation.id}</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Cargando comprobantes...</span>
            </div>
          ) : !latestProof ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No se han subido comprobantes de pago para esta reserva.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Latest Payment Proof Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  {isUserProof ? (
                    <User className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Shield className="h-5 w-5 text-green-600" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isUserProof 
                      ? "Último comprobante subido por el usuario"
                      : "Último comprobante subido por administrador"}
                  </h3>
                </div>
                <div className="space-y-3">
                  <PaymentProofCard 
                    key={latestProof.id}
                    proof={latestProof} 
                    onDownload={handleDownload}
                    safeFormatDate={safeFormatDate}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
