"use client";

import {
  Building,
  Clock,
  FileEdit,
  Loader2,
  MapPin,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import ScenarioService, {
  ScenarioDto,
  SubScenarioDto,
} from "@/services/scenario.service";
import { createReservationRepository } from "@/entities/reservation/infrastructure/reservation-repository.adapter";
import { ClientHttpClientFactory } from "@/shared/api/http-client-client";
import { createReservationAction, CreateReservationResult } from "../../use-cases/create/actions/create-reservation.action";
import UserService, { UserDto } from "@/services/user.service";
import { useCallback, useEffect, useState } from "react";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Modal } from "@/shared/ui/modal";
import debounce from "lodash/debounce";
import { toast } from "sonner";
import { TimeSlotDto } from "@/services/reservation.service";



interface CreateReservationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateReservationModal = ({
  open,
  onClose,
  onSuccess,
}: CreateReservationModalProps) => {
  /* ---------- catálogos ---------- */
  const [users, setUsers] = useState<UserDto[]>([]);
  const [scenarios, setScenarios] = useState<ScenarioDto[]>([]);
  const [subScenarios, setSubScenarios] = useState<SubScenarioDto[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlotDto[]>([]);

  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [scenarioSearchTerm, setScenarioSearchTerm] = useState("");
  const [subScenarioSearchTerm, setSubScenarioSearchTerm] = useState("");

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingScenarios, setLoadingScenarios] = useState(false);
  const [loadingSubScenarios, setLoadingSubScenarios] = useState(false);

  // Guardar el usuario seleccionado en estado
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioDto | null>(
    null,
  );
  const [selectedSubScenario, setSelectedSubScenario] =
    useState<SubScenarioDto | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any | null>(null);
  const [newReservation, setNewReservation] = useState({
    clientId: "",
    scenarioId: "",
    subScenarioId: "",
    timeSlotId: "",
    reservationDate: new Date().toISOString().split("T")[0],
    comments: "",
    status: true,
  });
  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    { id: number; startTime: string; endTime: string; available: boolean }[]
  >([]);

  const [isLoading, setLoading] = useState(false);

  // Debounce para búsqueda de usuarios
  const debouncedUserSearch = useCallback(
    debounce(async (term: string) => {
      if (!term || term.length < 2) {
        return;
      }

      setLoadingUsers(true);
      try {
        const response = await UserService.searchUsers(term);
        setUsers(response.data);
      } catch (error) {
        console.error("Error al buscar usuarios:", error);
        toast.error("No se pudieron cargar los usuarios");
      } finally {
        setLoadingUsers(false);
      }
    }, 300),
    [],
  );

  // Debounce para búsqueda de escenarios
  const debouncedScenarioSearch = useCallback(
    debounce(async (term: string) => {
      if (!term || term.length < 2) {
        return;
      }

      setLoadingScenarios(true);
      try {
        // Ajustar para usar los parámetros de búsqueda de la API
        const response = await ScenarioService.getAllScenarios(term);
        setScenarios(response);
      } catch (error) {
        console.error("Error al buscar escenarios:", error);
        toast.error("No se pudieron cargar los escenarios");
      } finally {
        setLoadingScenarios(false);
      }
    }, 300),
    [],
  );

  // Debounce para búsqueda de subescenarios
  const debouncedSubScenarioSearch = useCallback(
    debounce(async (term: string, scenarioId?: number) => {
      if (!scenarioId) return;

      setLoadingSubScenarios(true);
      try {
        const response = await ScenarioService.searchSubScenarios(
          scenarioId,
          1,
          10,
          term,
        );
        setSubScenarios(response.data);
      } catch (error) {
        console.error("Error al buscar subescenarios:", error);
        toast.error("No se pudieron cargar los subescenarios");
      } finally {
        setLoadingSubScenarios(false);
      }
    }, 300),
    [],
  );

  // Función para depurar y mostrar el usuario seleccionado en consola
  useEffect(() => {
    if (selectedUser) {
      console.log("Usuario seleccionado:", selectedUser);
    }
  }, [selectedUser]);

  // Efecto para la búsqueda de usuarios
  useEffect(() => {
    if (userSearchTerm.length >= 2) {
      debouncedUserSearch(userSearchTerm);
    }
  }, [userSearchTerm, debouncedUserSearch]);

  // Efecto para la búsqueda de escenarios
  useEffect(() => {
    if (scenarioSearchTerm.length >= 2) {
      debouncedScenarioSearch(scenarioSearchTerm);
    } else if (scenarioSearchTerm.length === 0 && open) {
      // Cargar todos los escenarios al abrir o limpiar la búsqueda
      (async () => {
        try {
          setLoadingScenarios(true);
          const scenData = await ScenarioService.getAllScenarios();
          setScenarios(scenData);
        } catch (err) {
          toast.error("No se pudieron cargar los escenarios");
        } finally {
          setLoadingScenarios(false);
        }
      })();
    }
  }, [scenarioSearchTerm, debouncedScenarioSearch, open]);

  // Efecto para la búsqueda de subescenarios
  useEffect(() => {
    if (!newReservation.scenarioId) return;

    const scenarioId = parseInt(newReservation.scenarioId);
    if (subScenarioSearchTerm.length >= 2) {
      debouncedSubScenarioSearch(subScenarioSearchTerm, scenarioId);
    } else {
      // Al cambiar el escenario o limpiar la búsqueda, cargamos todos los sub-escenarios filtrados
      (async () => {
        try {
          setLoadingSubScenarios(true);
          const response = await ScenarioService.searchSubScenarios(
            scenarioId,
            1,
            10,
          );
          setSubScenarios(response.data);
        } catch (error) {
          console.error("Error al cargar sub-escenarios:", error);
          toast.error("No se pudieron cargar los sub-escenarios");
        } finally {
          setLoadingSubScenarios(false);
        }
      })();
    }
  }, [
    newReservation.scenarioId,
    subScenarioSearchTerm,
    debouncedSubScenarioSearch,
  ]);

  // Efecto para cargar el usuario cuando ya tenemos un ID seleccionado
  useEffect(() => {
    if (newReservation.clientId && !selectedUser) {
      (async () => {
        try {
          // Obtener el usuario por ID
          const user = await UserService.getUserById(
            Number(newReservation.clientId),
          );
          if (user) setSelectedUser(user);
        } catch (error) {
          console.error("Error al cargar datos del usuario:", error);
        }
      })();
    }
  }, [newReservation.clientId, selectedUser]);

  // Efecto para cargar el escenario cuando ya tenemos un ID seleccionado
  useEffect(() => {
    if (newReservation.scenarioId && !selectedScenario) {
      const scenario = scenarios.find(
        (s) => s.id.toString() === newReservation.scenarioId,
      );
      if (scenario) setSelectedScenario(scenario);
    }
  }, [newReservation.scenarioId, selectedScenario, scenarios]);

  // Efecto para cargar el subescenario cuando ya tenemos un ID seleccionado
  useEffect(() => {
    if (newReservation.subScenarioId && !selectedSubScenario) {
      const subScenario = subScenarios.find(
        (ss) => ss.id.toString() === newReservation.subScenarioId,
      );
      if (subScenario) setSelectedSubScenario(subScenario);
    }
  }, [newReservation.subScenarioId, selectedSubScenario, subScenarios]);

  // Efecto para cargar el timeslot cuando ya tenemos un ID seleccionado
  useEffect(() => {
    if (newReservation.timeSlotId && !selectedTimeSlot) {
      const slot = availableTimeSlots.find(
        (slot) => slot.id.toString() === newReservation.timeSlotId,
      );
      if (slot) setSelectedTimeSlot(slot);
    }
  }, [newReservation.timeSlotId, selectedTimeSlot, availableTimeSlots]);

  // Efecto para manejar la carga inicial y reinicio del formulario cuando se cierra el modal
  useEffect(() => {
    if (open) {
      // Cargar escenarios al abrir el modal
      (async () => {
        try {
          setLoadingScenarios(true);
          const scenData = await ScenarioService.getAllScenarios();
          setScenarios(scenData);
        } catch (err) {
          toast.error("No se pudieron cargar los escenarios");
        } finally {
          setLoadingScenarios(false);
        }
      })();
    } else {
      // Limpiar formulario al cerrar el modal
      setNewReservation({
        clientId: "",
        scenarioId: "",
        subScenarioId: "",
        timeSlotId: "",
        reservationDate: new Date().toISOString().split("T")[0],
        comments: "",
        status: true,
      });
      setSelectedUser(null);
      setSelectedScenario(null);
      setSelectedSubScenario(null);
      setSelectedTimeSlot(null);
      setUserSearchTerm("");
      setScenarioSearchTerm("");
      setSubScenarioSearchTerm("");
    }
  }, [open]);

  /* ---------- disponibilidad ---------- */
  useEffect(() => {
    const { subScenarioId, reservationDate } = newReservation;
    if (!subScenarioId || !reservationDate) return;

    (async () => {
      try {
        // Use DDD repository pattern for timeslots with cookies authentication
        const httpClient = ClientHttpClientFactory.createClientWithCookies();
        const repository = createReservationRepository(httpClient);
        
        const slots = await repository.getAvailableTimeSlots(
          parseInt(subScenarioId),
          reservationDate,
        );
        
        // Convert TimeslotResponseDto[] to match component interface
        const convertedSlots = slots.map(slot => ({
          id: slot.id,
          startTime: slot.startTime,
          endTime: slot.endTime,
          available: slot.isAvailable, // Map isAvailable to available
        }));
        
        setAvailableTimeSlots(convertedSlots);
      } catch (error) {
        console.error("Error al cargar horarios disponibles:", error);
        toast.error("No se pudieron cargar los horarios disponibles");
      }
    })();
  }, [newReservation.subScenarioId, newReservation.reservationDate]);

  /* ---------- crear reserva ---------- */
  const handleCreate = async () => {
    const { clientId, subScenarioId, timeSlotId, reservationDate, comments } =
      newReservation;
    if (!clientId || !subScenarioId || !timeSlotId || !reservationDate) {
      toast.error("Todos los campos marcados con * son obligatorios.");
      return;
    }
    setLoading(true);
    try {
      // Use DDD server action instead of legacy service
      const result: CreateReservationResult = await createReservationAction({
        subScenarioId: parseInt(subScenarioId),
        timeSlotIds: [parseInt(timeSlotId)],
        reservationRange: {
          initialDate: reservationDate,
        },
        comments: comments || undefined,
      });
      
      if (result.success) {
        toast.success(result.message || "Reserva creada correctamente.");
        
        // Llamar al callback de éxito si existe
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      } else {
        toast.error(result.error || "No se pudo crear la reserva");
      }
    } catch (err: any) {
      console.error('Create reservation exception:', err);
      toast.error(err.message ?? "Ocurrió un error al crear la reserva");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Crear Reserva"
      size="xl"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            size="sm"
            className="px-3"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            size="sm"
            className="px-3"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Procesando
              </>
            ) : (
              "Crear Reserva"
            )}
          </Button>
        </>
      }
    >
      {/* --- formulario --- */}
      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        {/* Cliente */}
        <section className="bg-gray-50 p-3 rounded-md">
          <h3 className="font-medium text-gray-800 mb-2 text-sm flex items-center">
            <Users className="h-3 w-3 mr-1 text-teal-600" />
            Información del Cliente
          </h3>
          <div className="space-y-1">
            <Label className="text-xs font-medium">Cliente*</Label>

            {/* Select con búsqueda integrada para USUARIOS */}
            <Select
              value={newReservation.clientId}
              onValueChange={(v) => {
                setNewReservation({ ...newReservation, clientId: v });
                const user: UserDto | undefined = users.find(
                  (u) => u.id.toString() === v,
                );
                if (user) setSelectedUser(user);
              }}
              onOpenChange={(open) => {
                if (open && userSearchTerm.length >= 2) {
                  debouncedUserSearch(userSearchTerm);
                }
              }}
            >
              <SelectTrigger className="bg-white h-8 text-xs">
                <SelectValue placeholder="Buscar cliente…" />
                {selectedUser && (
                  <span className="flex items-center text-xs absolute inset-y-0 left-2 pointer-events-none">
                    <UserRound className="w-3 h-3 mr-1.5 text-teal-600" />
                    {selectedUser.first_name} {selectedUser.last_name}
                  </span>
                )}
              </SelectTrigger>

              <SelectContent className="max-h-60">
                <div className="px-2 py-1.5 sticky top-0 bg-white z-10 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                    <Input
                      type="text"
                      className="bg-white h-7 text-xs pl-7 pr-7"
                      placeholder="Buscar por nombre o email..."
                      value={userSearchTerm}
                      onChange={(e) => {
                        setUserSearchTerm(e.target.value);
                      }}
                      // Evitar que el Select se cierre al escribir
                      onClick={(e) => e.stopPropagation()}
                    />
                    {loadingUsers && (
                      <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 animate-spin text-gray-400" />
                    )}
                  </div>
                </div>

                <div className="max-h-40 overflow-y-auto py-1">
                  {users.length > 0 ? (
                    users.slice(0, 5).map((u) => (
                      <SelectItem
                        key={u.id}
                        value={u.id.toString()}
                        className="text-xs my-0.5"
                      >
                        <div className="flex items-center">
                          <UserRound className="w-3 h-3 mr-1.5 text-teal-600" />
                          <span className="font-medium">
                            {u.first_name} {u.last_name}
                          </span>
                          <span className="text-gray-500 ml-1">{u.email}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="text-xs text-center py-2 text-gray-500">
                      {userSearchTerm.length < 2
                        ? "Ingresa al menos 2 caracteres para buscar"
                        : loadingUsers
                          ? "Buscando usuarios..."
                          : "No se encontraron usuarios"}
                    </div>
                  )}
                </div>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Escenario y Horario */}
        <section className="bg-gray-50 p-3 rounded-md">
          <h3 className="font-medium text-gray-800 mb-2 text-sm flex items-center">
            <MapPin className="h-3 w-3 mr-1 text-teal-600" />
            Escenario y Horario
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {/* Escenario con búsqueda integrada */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Escenario*</Label>
              <Select
                value={newReservation.scenarioId}
                onValueChange={(v) => {
                  setNewReservation({
                    ...newReservation,
                    scenarioId: v,
                    subScenarioId: "",
                  });
                  const scenario = scenarios.find((s) => s.id.toString() === v);
                  if (scenario) setSelectedScenario(scenario);
                  setSelectedSubScenario(null); // Resetear subescenario
                }}
              >
                <SelectTrigger className="bg-white h-8 text-xs">
                  {newReservation.scenarioId && selectedScenario ? (
                    // Mostrar información del escenario seleccionado sin formato preestablecido
                    <div className="flex items-center text-xs">
                      <Building className="w-3 h-3 mr-1.5 text-teal-600" />
                      {selectedScenario.name}
                    </div>
                  ) : (
                    <SelectValue placeholder="Seleccione..." />
                  )}
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <div className="px-2 py-1.5 sticky top-0 bg-white z-10 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                      <Input
                        type="text"
                        className="bg-white h-7 text-xs pl-7 pr-7"
                        placeholder="Buscar escenario..."
                        value={scenarioSearchTerm}
                        onChange={(e) => setScenarioSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {loadingScenarios && (
                        <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 animate-spin text-gray-400" />
                      )}
                    </div>
                  </div>

                  <div className="max-h-40 overflow-y-auto py-1">
                    {scenarios.length > 0 ? (
                      scenarios.map((s) => (
                        <SelectItem
                          key={s.id}
                          value={s.id.toString()}
                          className="text-xs my-0.5"
                        >
                          <div className="flex items-center">
                            <Building className="w-3 h-3 mr-1.5 text-teal-600" />
                            <span className="font-medium">{s.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="text-xs text-center py-2 text-gray-500">
                        {loadingScenarios
                          ? "Cargando escenarios..."
                          : "No se encontraron escenarios"}
                      </div>
                    )}
                  </div>
                </SelectContent>
              </Select>
            </div>

            {/* Subescenario con búsqueda integrada y límite de 10 */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Subescenario*</Label>
              <Select
                disabled={!newReservation.scenarioId}
                value={newReservation.subScenarioId}
                onValueChange={(v) => {
                  setNewReservation({ ...newReservation, subScenarioId: v });
                  const subScenario = subScenarios.find(
                    (ss) => ss.id.toString() === v,
                  );
                  if (subScenario) setSelectedSubScenario(subScenario);
                }}
              >
                <SelectTrigger className="bg-white h-8 text-xs">
                  {newReservation.subScenarioId && selectedSubScenario ? (
                    // Mostrar información del subescenario seleccionado sin formato preestablecido
                    <div className="flex items-center text-xs">
                      <MapPin className="w-3 h-3 mr-1.5 text-teal-600" />
                      {selectedSubScenario.name}
                    </div>
                  ) : (
                    <SelectValue placeholder="Seleccione..." />
                  )}
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <div className="px-2 py-1.5 sticky top-0 bg-white z-10 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                      <Input
                        type="text"
                        className="bg-white h-7 text-xs pl-7 pr-7"
                        placeholder="Buscar subescenario..."
                        value={subScenarioSearchTerm}
                        onChange={(e) =>
                          setSubScenarioSearchTerm(e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        disabled={!newReservation.scenarioId}
                      />
                      {loadingSubScenarios && (
                        <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 animate-spin text-gray-400" />
                      )}
                    </div>
                  </div>

                  <div className="max-h-40 overflow-y-auto py-1">
                    {subScenarios.length > 0 ? (
                      // Limite de 10 subescenarios mostrados a la vez
                      subScenarios.slice(0, 10).map((ss) => (
                        <SelectItem
                          key={ss.id}
                          value={ss.id.toString()}
                          className="text-xs my-0.5"
                        >
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1.5 text-teal-600" />
                            <span className="font-medium">{ss.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="text-xs text-center py-2 text-gray-500">
                        {!newReservation.scenarioId
                          ? "Seleccione un escenario primero"
                          : loadingSubScenarios
                            ? "Cargando subescenarios..."
                            : "No se encontraron subescenarios"}
                      </div>
                    )}
                  </div>
                </SelectContent>
              </Select>
              {newReservation.scenarioId &&
                subScenarios.length === 0 &&
                !loadingSubScenarios && (
                  <p className="text-xs text-red-500 mt-1">
                    No hay subescenarios disponibles
                  </p>
                )}
            </div>

            {/* Fecha */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Fecha*</Label>
              <Input
                type="date"
                className="bg-white h-8 text-xs"
                value={newReservation.reservationDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) =>
                  setNewReservation({
                    ...newReservation,
                    reservationDate: e.target.value,
                  })
                }
              />
            </div>

            {/* Horario */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Horario*</Label>
              <Select
                disabled={!newReservation.subScenarioId}
                value={newReservation.timeSlotId}
                onValueChange={(v) => {
                  setNewReservation({ ...newReservation, timeSlotId: v });
                  const slot = availableTimeSlots.find(
                    (slot) => slot.id.toString() === v,
                  );
                  if (slot) setSelectedTimeSlot(slot);
                }}
              >
                <SelectTrigger className="bg-white h-8 text-xs">
                  {newReservation.timeSlotId && selectedTimeSlot ? (
                    // Mostrar información del horario seleccionado
                    <div className="flex items-center text-xs">
                      <Clock className="w-3 h-3 mr-1.5 text-teal-600" />
                      {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
                    </div>
                  ) : (
                    <SelectValue placeholder="Seleccione..." />
                  )}
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <div className="max-h-40 overflow-y-auto py-1">
                    {availableTimeSlots
                      .filter((s) => s.available)
                      .map((slot) => (
                        <SelectItem
                          key={slot.id}
                          value={slot.id.toString()}
                          className="text-xs my-0.5"
                        >
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1.5 text-teal-600" />
                            {slot.startTime} - {slot.endTime}
                          </div>
                        </SelectItem>
                      ))}
                  </div>
                </SelectContent>
              </Select>

              {/* Mensaje de disponibilidad */}
              {newReservation.subScenarioId &&
                newReservation.reservationDate &&
                !isLoading &&
                availableTimeSlots.filter((s) => s.available).length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    No hay horarios disponibles
                  </p>
                )}
            </div>
          </div>
        </section>

        {/* Comentarios y estado */}
        <section className="bg-gray-50 p-3 rounded-md">
          <h3 className="font-medium text-gray-800 mb-2 text-sm flex items-center">
            <FileEdit className="h-3 w-3 mr-1 text-teal-600" />
            Información Adicional
          </h3>

          <div className="space-y-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Comentarios</Label>
              <Textarea
                className="bg-white resize-none h-16 text-xs"
                value={newReservation.comments}
                onChange={(e) =>
                  setNewReservation({
                    ...newReservation,
                    comments: e.target.value,
                  })
                }
                placeholder="Ingrese cualquier detalle adicional sobre la reserva..."
              />
            </div>

            <div className="flex items-center justify-between bg-white py-1 px-2 rounded-md">
              <Label className="text-xs font-medium cursor-pointer">
                Estado activo
              </Label>
              <Switch
                checked={newReservation.status}
                onCheckedChange={(c) =>
                  setNewReservation({ ...newReservation, status: c })
                }
              />
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
};
