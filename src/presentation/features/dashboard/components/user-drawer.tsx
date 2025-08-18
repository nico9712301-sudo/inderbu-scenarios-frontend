"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { useEffect, useState } from "react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { UserPlainObject } from "@/entities/user/domain/UserEntity";
import { EUserRole } from "@/shared/enums/user-role.enum";
import { SearchSelect } from "@/shared/components/molecules/search-select";
import { searchNeighborhoods } from "@/presentation/features/home/services/home.service";

type User = UserPlainObject;

interface IRoleOption {
  id: number;
  name: string;
}

interface IINeighborhoodOptionDTO {
  id: number;
  name: string;
}

interface UserDrawerProps {
  open: boolean;
  user: UserPlainObject | null;
  onClose: () => void;
  onSave: (data: Partial<User>) => Promise<void>;
}

/* ---------- Componente ---------- */
export function UserDrawer({
  open,
  user,
  onClose,
  onSave,
}: UserDrawerProps) {
  const [form, setForm] = useState<Partial<User>>({});
  const [roles, setRoles] = useState<IRoleOption[]>([
    { id: 3, name: "Independiente" },
    { id: 4, name: "Club Deportivo" },
    { id: 5, name: "Entrenador" },
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  /* Resetea el formulario cada vez que cambie el user */
  useEffect(() => {
    if (user) {
      setForm({
        dni: user.dni,
        firstName: user.firstName || user.firstName || "",
        lastName: user.lastName || user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        active: user.active !== undefined ? user.active : true,
        role: user.role ?? undefined,
        roleId: user.roleId,
        neighborhood: user.neighborhood ?? undefined,
        neighborhoodId: user.neighborhoodId ?? undefined,
      });
      setIsEditing(true);
    } else {
      setForm({
        dni: 0,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        active: true,
        roleId: EUserRole.INDEPENDIENTE,
        neighborhood: undefined,
        neighborhoodId: undefined,
      });
      setIsEditing(false);
    }
  }, [user]);

  /* Helpers */
  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave(form);
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handle =
    (field: keyof User) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [field]: e.target.value });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[650px] max-h-[80vh] mx-auto bg-white overflow-y-auto" aria-describedby="user-drawer-description" aria-description="user-drawer-description">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl text-teal-700">
            {user
              ? `Editar Usuario: ${user.firstName || user.firstName || ""} ${user.lastName || user.lastName || ""}`
              : "Nuevo Usuario"}
          </DialogTitle>
        </DialogHeader>

        {/* ---------- Cuerpo scrollable ---------- */}
        <form name="user-form">
          <div className="space-y-4 overflow-y-auto max-h-[calc(80vh-180px)]">
          {/* Información Básica */}
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="font-medium text-gray-800 mb-2 text-sm flex items-center">
              <svg
                className="h-3 w-3 mr-1 text-teal-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Información Básica
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Field id="user-dni" label="DNI*">
                <Input
                  className="bg-white h-9"
                  value={form.dni || ""}
                  onChange={(e) =>
                    setForm({ ...form, dni: Number(e.target.value) })
                  }
                />
              </Field>

              <Field id="user-role" label="Rol*">
                <Select
                  value={form.roleId+"" || ""}
                  onValueChange={(value) => {
                    setForm({
                      ...form,
                      roleId: +value,
                    });
                  }}
                >
                  <SelectTrigger className="bg-white h-9">
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

              <Field id="user-firstName" label="Nombre*">
                <Input
                  className="bg-white h-9"
                  value={form.firstName || ""}
                  onChange={handle("firstName")}
                />
              </Field>

              <Field id="user-lastName" label="Apellido*">
                <Input
                  className="bg-white h-9"
                  value={form.lastName || ""}
                  onChange={handle("lastName")}
                />
              </Field>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="font-medium text-gray-800 mb-2 text-sm flex items-center">
              <svg
                className="h-3 w-3 mr-1 text-teal-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              Información de Contacto
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Field id="user-email" label="Email*">
                <Input
                  className="bg-white h-9"
                  type="email"
                  value={form.email || ""}
                  onChange={handle("email")}
                  autoComplete="email"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  name="user-email"
                  data-form-type="user"
                />
              </Field>

              <Field id="user-phone" label="Teléfono*">
                <Input
                  className="bg-white h-9"
                  type="tel"
                  value={form.phone || ""}
                  onChange={handle("phone")}
                />
              </Field>

              <Field id="user-neighborhood" label="Barrio*">
                <SearchSelect
                  className="w-full bg-white h-9"
                  placeholder="Seleccionar barrio"
                  searchPlaceholder="Buscar barrio..."
                  value={form.neighborhoodId?.toString() || ""}
                  onValueChange={(value) => {
                    setForm({
                      ...form,
                      neighborhoodId: Number(value),
                    });
                  }}
                  onSearch={searchNeighborhoods}
                  emptyMessage="No se encontraron barrios"
                  initialOption={
                    form.neighborhood
                      ? {
                          id: form.neighborhood.id,
                          name: form.neighborhood.name,
                        }
                      : undefined
                  }
                />
              </Field>

              <Field id="user-address" label="Dirección*">
                <Input
                  className="bg-white h-9"
                  value={form.address || ""}
                  onChange={handle("address")}
                />
              </Field>
            </div>
          </div>

          {/* Configuración de Cuenta */}
          {!isEditing && (
          <div className="bg-gray-50 p-3 rounded-md">
            <h3 className="font-medium text-gray-800 mb-2 text-sm flex items-center">
              <svg
                className="h-3 w-3 mr-1 text-teal-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Configuración de Cuenta
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Field id="user-password" label="Contraseña">
                <Input
                  className="bg-white h-9"
                  type="password"
                  placeholder={
                    user
                      ? "Dejar en blanco para mantener la actual"
                      : "Ingrese contraseña"
                  }
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </Field>

              <div className="px-2 py-2 flex items-center justify-between bg-white rounded-md">
                <Label htmlFor="user-status" className="text-sm font-medium">
                  Estado Activo
                </Label>
                <div className="flex flex-col items-end">
                  <Switch
                    id="user-status"
                    checked={form.active}
                    onCheckedChange={(v) => setForm({ ...form, active: v })}
                  />
                  <span className="text-xs text-gray-500 mt-1">
                    {form.active ? "Usuario activo" : "Usuario inactivo"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          )}
          </div>
        </form>

        {/* ---------- Footer ---------- */}
        <DialogFooter className="flex justify-end gap-3 pt-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-4"
            size="sm"
          >
            Cancelar
          </Button>
          <Button
            className="bg-teal-600 hover:bg-teal-700 px-4"
            onClick={handleSave}
            disabled={loading}
            size="sm"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Guardando...
              </>
            ) : (
              "Guardar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
