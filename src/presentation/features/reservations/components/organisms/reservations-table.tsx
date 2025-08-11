"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { ClickableStatusBadge } from "../molecules/clickable-status-badge";
import type { ReservationDto } from "@/services/reservation.service";
import { formatDate, reservationStateById } from "@/shared/utils/utils";
import { DataTable } from "@/shared/ui/data-table";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { FileEdit, Calendar, Repeat, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale/es";

interface ReservationsTableProps {
  reservations: ReservationDto[];
  isLoading: boolean;
  onEdit: (reservation: ReservationDto) => void;
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const weekdayNames = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"] as const;

const fmtDate = (d: string) =>
  format(parseISO(d), "dd MMM yyyy", { locale: es });
const fmtTime = (t: string) =>
  format(parseISO(`1970-01-01T${t}`), "h aaa", { locale: es });

const ReservationTypeBadge = ({ type }: { type: string }) =>
  type === "SINGLE" ? (
    <Badge
      variant="outline"
      className="bg-blue-50 text-blue-700 border-blue-200"
    >
      <Calendar className="w-3 h-3 mr-1" /> Única
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="bg-purple-50 text-purple-700 border-purple-200"
    >
      <Repeat className="w-3 h-3 mr-1" /> Recurrente
    </Badge>
  );

/* -------------------------------- WeekDays -------------------------------- */
const WeekDaysDisplay = ({ weekDays }: { weekDays: number[] | null }) => {
  if (!weekDays?.length) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {weekDays.map((d) => (
        <Badge key={d} variant="secondary" className="text-xs px-1 py-0">
          {weekdayNames[d]}
        </Badge>
      ))}
    </div>
  );
};

/* ------------------------------- Time Slots ------------------------------- */
const TimeSlotDisplay = ({ reservation }: { reservation: ReservationDto }) => {
  const { type, timeSlot, timeslots } = reservation;

  if (type === "SINGLE" && timeSlot) {
    return (
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3 text-muted-foreground" />
        <span className="text-sm">
          {fmtTime(timeSlot.startTime)} – {fmtTime(timeSlot.endTime)}
        </span>
      </div>
    );
  }

  if (type === "RANGE" && timeslots?.length) {
    if (timeslots.length === 1) {
      return (
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-sm">
            {fmtTime(timeslots[0].startTime)} – {fmtTime(timeslots[0].endTime)}
          </span>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {timeslots.length} horarios
          </span>
        </div>
        <div className="text-xs text-muted-foreground space-y-0.5">
          {timeslots.slice(0, 2).map((slot, idx) => (
            <div key={idx}>
              {fmtTime(slot.startTime)} – {fmtTime(slot.endTime)}
            </div>
          ))}
          {timeslots.length > 2 && (
            <div className="text-muted">+{timeslots.length - 2} más…</div>
          )}
        </div>
      </div>
    );
  }

  return <span className="text-xs text-muted-foreground">Sin horario</span>;
};

/* ------------------------------ Date display ------------------------------ */
const DateDisplay = ({ reservation }: { reservation: ReservationDto }) => {
  const { type, initialDate, finalDate, totalInstances } = reservation;

  if (type === "SINGLE") {
    return (
      <div>
        <div className="font-medium text-sm">{fmtDate(initialDate)}</div>
        <ReservationTypeBadge type={type} />
      </div>
    );
  }

  return (
    <div className="space-y-1 text-sm">
      <div>
        <span className="font-medium">{fmtDate(initialDate)}</span>
        {finalDate && (
          <span className="text-xs text-muted-foreground block">
            hasta {fmtDate(finalDate)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ReservationTypeBadge type={type} />
        {totalInstances && (
          <Badge variant="outline" className="text-xs">
            {totalInstances} sesiones
          </Badge>
        )}
      </div>
      <WeekDaysDisplay weekDays={reservation.weekDays} />
    </div>
  );
};

export const ReservationsTable = ({
  reservations,
  isLoading,
  onEdit,
  page,
  pageSize,
  totalItems,
  onPageChange,
}: ReservationsTableProps) => {
  // Local optimistic updates for status changes
  const [rows, setRows] = useState<ReservationDto[]>([]);
  useEffect(() => setRows(reservations), [reservations]);

  /* -------------------------------- Columns -------------------------------- */
  const columns = useMemo(
    () => [
      {
        id: "client",
        header: "Cliente",
        cell: (row: ReservationDto) => (
          <div className="min-w-[180px]">
            <div className="font-medium text-sm">
              {row.user
                ? `${row.user.firstName} ${row.user.lastName}`
                : "Cliente sin nombre"}
            </div>
            {row.user?.email && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {row.user.email}
              </div>
            )}
            {row.user?.phone && (
              <div className="text-xs text-muted-foreground">
                {row.user.phone}
              </div>
            )}
          </div>
        ),
      },
      {
        id: "venue",
        header: "Escenario",
        cell: (row: ReservationDto) => (
          <div className="min-w-[200px] space-y-1">
            <div className="font-medium text-sm">
              {row.subScenario?.scenarioName ?? "Sin escenario"}
            </div>
            <div className="text-xs text-muted-foreground line-clamp-2">
              {row.subScenario?.name ?? "Escenario sin nombre"}
            </div>
            <div className="flex items-center gap-2">
              {row.subScenario?.hasCost ? (
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                >
                  De pago
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 text-xs"
                >
                  Gratuito
                </Badge>
              )}
              {row.subScenario?.numberOfSpectators && (
                <Badge variant="secondary" className="text-xs">
                  {row.subScenario.numberOfSpectators} personas
                </Badge>
              )}
            </div>
          </div>
        ),
      },
      {
        id: "details",
        header: "Detalles de reserva",
        cell: (row: ReservationDto) => <DateDisplay reservation={row} />,
      },
      {
        id: "time",
        header: "Horarios",
        cell: (row: ReservationDto) => <TimeSlotDisplay reservation={row} />,
      },
      {
        id: "created",
        header: "Creada",
        cell: (row: ReservationDto) => (
          <div className="text-sm">
            <div>{fmtDate(row.createdAt)}</div>
            {row.updatedAt && row.updatedAt !== row.createdAt && (
              <div className="text-xs text-muted-foreground mt-0.5">
                Act. {fmtDate(row.updatedAt)}
              </div>
            )}
          </div>
        ),
      },
      {
        id: "status",
        header: "Estado",
        cell: (row: ReservationDto) => {
          const currentStatusId = row.reservationState?.id ?? row.reservationStateId ?? 1;

          return (
            <ClickableStatusBadge
              statusId={currentStatusId}
              reservationId={row.id}
              reservationInfo={{
                userEmail: row.user?.email,
                date: fmtDate(row.initialDate),
              }}
              onStatusChange={(newStatusId) => {
                setRows((prev) => {
                  const copy = [...prev];
                  const index = copy.findIndex((r) => r.id === row.id);
                  if (index !== -1) {
                    const newState =
                      reservationStateById[newStatusId] || "PENDIENTE";
                    copy[index] = {
                      ...copy[index],
                      reservationState: { id: newStatusId, state: newState },
                    } as ReservationDto;
                  }
                  return copy;
                });
              }}
            />
          );
        },
      },
      {
        id: "actions",
        header: "", // empty header for compactness
        cell: (row: ReservationDto) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row)}
            aria-label="Ver detalles"
          >
            <FileEdit className="w-4 h-4" />
          </Button>
        ),
      },
    ],
    [onEdit]
  );

  /* ----------------------------- Render table ----------------------------- */
  return (
    <DataTable
      data={rows}
      columns={columns}
      totalItems={totalItems}
      pageSize={pageSize}
      currentPage={page}
      totalPages={Math.ceil(totalItems / pageSize)}
      onPageChange={onPageChange}
      isLoading={isLoading}
    />
  );
};
