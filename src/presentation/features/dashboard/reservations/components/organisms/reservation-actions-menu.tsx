"use client";

import { MoreVertical, Eye, FileText, Mail, Receipt } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import type { ReservationDto } from "@/entities/reservation/model/types";

interface ReservationActionsMenuProps {
  reservation: ReservationDto;
  onViewDetail: (reservation: ReservationDto) => void;
  onGenerateReceipt?: (reservation: ReservationDto) => void;
  onSendReceipt?: (reservation: ReservationDto) => void;
  onViewReceipts?: (reservation: ReservationDto) => void;
}

export function ReservationActionsMenu({
  reservation,
  onViewDetail,
  onGenerateReceipt,
  onSendReceipt,
  onViewReceipts,
}: ReservationActionsMenuProps) {
  const hasCost = reservation.subScenario?.hasCost ?? false;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Acciones"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewDetail(reservation)}>
          <Eye className="mr-2 h-4 w-4" />
          Ver detalle
        </DropdownMenuItem>

        {hasCost && (
          <>
            {onGenerateReceipt && (
              <DropdownMenuItem onClick={() => onGenerateReceipt(reservation)}>
                <FileText className="mr-2 h-4 w-4" />
                Generar recibo
              </DropdownMenuItem>
            )}
            {onSendReceipt && (
              <DropdownMenuItem onClick={() => onSendReceipt(reservation)}>
                <Mail className="mr-2 h-4 w-4" />
                Enviar recibo por email
              </DropdownMenuItem>
            )}
            {onViewReceipts && (
              <DropdownMenuItem onClick={() => onViewReceipts(reservation)}>
                <Receipt className="mr-2 h-4 w-4" />
                Ver facturas
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
