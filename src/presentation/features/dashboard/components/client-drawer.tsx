"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";


/* ---------- Tipos ---------- */
export interface IClient {
  id?: string;
  dni: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  roleId: number;
  neighborhoodId: number;
  role?: {
    id: number;
    name: string;
  };
  neighborhood?: {
    id: number;
    name: string;
  };
  isActive: boolean;
  observations?: string;
  password?: string;
  confirmPassword?: string;
}

interface ClientDrawerProps {
  open: boolean;
  client: IClient | null;
  onClose: () => void;
  onSave: (data: Partial<IClient>) => Promise<void>;
}

/* ---------- Componente ---------- */
export function ClientDrawer({
  open,
  client,
  onClose,
  onSave,
}: ClientDrawerProps) {
  const [form, setForm] = useState<Partial<IClient>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<
    { id: number; name: string }[]
  >([]);

  /* Cargar roles y barrios */
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch roles
        const rolesResponse = await fetch(`http://localhost:3001/roles`);
        const rolesData = await rolesResponse.json();
        setRoles(rolesData.data);

        // Fetch neighborhoods
        const neighborhoodsResponse = await fetch(
          `http://localhost:3001/neighborhoods`,
        );
        const neighborhoodsData = await neighborhoodsResponse.json();
        setNeighborhoods(neighborhoodsData.data);
      } catch (error) {
        console.error("Error fetching options:", error);
      }
    };

    fetchOptions();
  }, []);

  /* Resetea el formulario cada vez que cambie el cliente */
  useEffect(() => {
    if (client) {
      // Mapear el cliente existente al formato actualizado del formulario
      setForm({
        ...client,
        dni: client.dni || 0,
        firstName: client.firstName || "",
        lastName: client.lastName || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        roleId: client.roleId || client.role?.id || 0,
        neighborhoodId: client.neighborhoodId || client.neighborhood?.id || 0,
        isActive: client.isActive ?? true,
        observations: client.observations || "",
      });
    } else {
      // Para un nuevo cliente, inicializar con valores predeterminados
      setForm({
        dni: 0,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        roleId: 0,
        neighborhoodId: 0,
        isActive: true,
        observations: "",
      });
    }
  }, [client]);

  /* Helpers */
  const handleSave = async () => {
    try {
      // Validar datos requeridos
      if (
        !form.dni ||
        !form.firstName ||
        !form.lastName ||
        !form.email ||
        !form.phone ||
        !form.address ||
        !form.roleId ||
        !form.neighborhoodId
      ) {
        alert("Por favor complete todos los campos obligatorios.");
        return;
      }

      // Si es un nuevo cliente y se proporciona contraseña, validar que coincidan
      if (!client && form.password && form.password !== form.confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
      }

      // Preparar datos para enviar
      const dataToSave = { ...form };
      // Eliminar campo confirmPassword antes de enviar al API
      if (dataToSave.confirmPassword) {
        delete dataToSave.confirmPassword;
      }

      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      alert("Error al guardar los datos del cliente.");
    }
  };

  const handle =
    (field: keyof IClient) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [field]: e.target.value });

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="w-full mx-auto sm:max-w-[80%] max-h-[80vh] bg-white inset-x-0 top-1/2 rounded-t-lg transform -translate-y-1/2">
        <DrawerHeader>
          <DrawerTitle>
            {client ? `Editar Cliente ${client.name}` : "Nuevo Cliente"}
          </DrawerTitle>
        </DrawerHeader>

        {/* ---------- Cuerpo scrollable ---------- */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(80vh-220px)]">
          {/* Línea 1: DNI + Rol */}
          <div className="grid grid-cols-2 gap-4">
            <Field id="client-dni" label="DNI*">
              <Input
                type="number"
                value={form.dni || ""}
                onChange={(e) =>
                  setForm({ ...form, dni: Number(e.target.value) })
                }
              />
            </Field>

            <Field id="client-role" label="Rol*">
              <Select
                value={form.roleId?.toString() || ""}
                onValueChange={(value) =>
                  setForm({
                    ...form,
                    roleId: Number(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          {/* Línea 2: Nombre + Apellido */}
          <div className="grid grid-cols-2 gap-4">
            <Field id="client-firstName" label="Nombre*">
              <Input
                value={form.firstName || ""}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
              />
            </Field>

            <Field id="client-lastName" label="Apellido*">
              <Input
                value={form.lastName || ""}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </Field>
          </div>

          {/* Email */}
          <Field id="client-email" label="Email*">
            <Input
              type="email"
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>

          {/* Teléfono */}
          <Field id="client-phone" label="Teléfono*">
            <Input
              type="tel"
              value={form.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>

          {/* Barrio */}
          <Field id="client-neighborhood" label="Barrio*">
            <Select
              value={form.neighborhoodId?.toString() || ""}
              onValueChange={(value) =>
                setForm({
                  ...form,
                  neighborhoodId: Number(value),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar barrio" />
              </SelectTrigger>
              <SelectContent>
                {neighborhoods.map((neighborhood) => (
                  <SelectItem
                    key={neighborhood.id}
                    value={neighborhood.id.toString()}
                  >
                    {neighborhood.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Dirección */}
          <Field id="client-address" label="Dirección*">
            <Input
              value={form.address || ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Field>

          {/* Observaciones */}
          <Field id="client-observations" label="Observaciones">
            <Textarea
              rows={3}
              value={form.observations || ""}
              onChange={(e) =>
                setForm({ ...form, observations: e.target.value })
              }
            />
          </Field>

          {/* Contraseña */}
          <Field id="client-password" label="Contraseña">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={
                  client
                    ? "Dejar en blanco para mantener la actual"
                    : "Ingrese contraseña"
                }
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </Field>

          {/* Confirmar Contraseña */}
          {!client && (
            <Field id="client-confirmPassword" label="Confirmar contraseña">
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirme su contraseña"
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </Field>
          )}

          {/* Estado */}
          <div className="flex items-center justify-between py-2">
            <Label htmlFor="client-status">Estado</Label>
            <Switch
              id="client-status"
              checked={form.isActive}
              onCheckedChange={(v) => setForm({ ...form, isActive: v })}
            />
          </div>
        </div>

        {/* ---------- Footer ---------- */}
        <DrawerFooter>
          <Button
            className="w-full bg-green-500 hover:bg-green-600"
            onClick={handleSave}
          >
            Guardar
          </Button>

          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

/* ---------- Helper Field ---------- */
function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
