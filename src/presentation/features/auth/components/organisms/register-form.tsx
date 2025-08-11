"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { Form } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { AuthFormField } from "@/shared/ui/auth-form-field";
import { PasswordInput } from "@/shared/ui/password-input";
import { SubmitButton } from "@/shared/ui/submit-button";
import { FormNavigation } from "../molecules/form-navigation";
import { SelectField } from "../molecules/select-field";
import { registerSchema, TRegisterData } from "../../schemas/auth-schemas";
import { IFormHandler } from "../../interfaces/form-handler.interface";
import { IFormNavigation } from "../../interfaces/form-navigation.interface";
// NEW DDD ARCHITECTURE
import { getRoleOptions, type RoleOption } from "../../utils/role-helpers";
import { getNeighborhoods } from "@/presentation/features/home/services/home.service";

interface RegisterFormProps {
  onSubmit: IFormHandler<TRegisterData>["onSubmit"];
  isLoading: boolean;
  navigation: IFormNavigation;
}

interface NeighborhoodOption {
  id: number;
  name: string;
}

export function RegisterForm({ onSubmit, isLoading, navigation }: RegisterFormProps) {
  const form = useForm<TRegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      dni: 0,
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
      email: "",
      password: "",
      confirmPassword: "",
      roleId: 0,
      neighborhoodId: 0,
    },
  });

  // NEW DDD ARCHITECTURE: Roles from enum
  const roles: RoleOption[] = getRoleOptions();

  // NEW DDD ARCHITECTURE: Neighborhoods from repository
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodOption[]>([]);
  const [isLoadingNeighborhoods, setIsLoadingNeighborhoods] = useState(true);

  useEffect(() => {
    const loadNeighborhoods = async () => {
      try {
        setIsLoadingNeighborhoods(true);
        const data = await getNeighborhoods();
        setNeighborhoods(data);
      } catch (error) {
        console.error('Error loading neighborhoods:', error);
        setNeighborhoods([]);
      } finally {
        setIsLoadingNeighborhoods(false);
      }
    };

    loadNeighborhoods();
  }, []);

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-4 mb-4">
          <AuthFormField label="DNI" error={form.formState.errors.dni?.message} required>
            <Input
              {...form.register("dni", { valueAsNumber: true })}
              type="number"
              placeholder="123456789"
              disabled={isLoading}
            />
          </AuthFormField>

          <AuthFormField label="Nombre" error={form.formState.errors.firstName?.message} required>
            <Input
              {...form.register("firstName")}
              placeholder="John"
              disabled={isLoading}
            />
          </AuthFormField>

          <AuthFormField label="Apellido" error={form.formState.errors.lastName?.message} required>
            <Input
              {...form.register("lastName")}
              placeholder="Doe"
              disabled={isLoading}
            />
          </AuthFormField>

          <AuthFormField label="Teléfono" error={form.formState.errors.phone?.message} required>
            <Input
              {...form.register("phone")}
              placeholder="1234567890"
              disabled={isLoading}
            />
          </AuthFormField>

          <AuthFormField label="Dirección" error={form.formState.errors.address?.message} required>
            <Input
              {...form.register("address")}
              placeholder="123 Main St"
              disabled={isLoading}
            />
          </AuthFormField>

          <AuthFormField label="Correo electrónico" error={form.formState.errors.email?.message} required>
            <Input
              {...form.register("email")}
              type="email"
              placeholder="ejemplo@correo.com"
              disabled={isLoading}
            />
          </AuthFormField>

          <AuthFormField label="Contraseña" error={form.formState.errors.password?.message} required>
            <PasswordInput
              {...form.register("password")}
              placeholder="••••••••"
              disabled={isLoading}
            />
          </AuthFormField>

          <AuthFormField label="Confirmar contraseña" error={form.formState.errors.confirmPassword?.message} required>
            <PasswordInput
              {...form.register("confirmPassword")}
              placeholder="••••••••"
              disabled={isLoading}
            />
          </AuthFormField>

          <SelectField
            label="Rol"
            placeholder="Selecciona un rol..."
            options={roles}
            value={form.watch("roleId") ? String(form.watch("roleId")) : undefined}
            onChange={(value) => form.setValue("roleId", Number(value))}
            disabled={isLoading}
            error={form.formState.errors.roleId?.message}
            getOptionValue={(role) => String(role.id)}
            getOptionLabel={(role) => role.name}
            required
          />

          <SelectField
            label="Barrio"
            placeholder={isLoadingNeighborhoods ? "Cargando barrios..." : "Selecciona un barrio..."}
            options={neighborhoods}
            value={form.watch("neighborhoodId") ? String(form.watch("neighborhoodId")) : undefined}
            onChange={(value) => form.setValue("neighborhoodId", Number(value))}
            disabled={isLoading || isLoadingNeighborhoods}
            error={form.formState.errors.neighborhoodId?.message}
            getOptionValue={(neighborhood) => String(neighborhood.id)}
            getOptionLabel={(neighborhood) => neighborhood.name}
            required
          />
        </div>

        <SubmitButton isLoading={isLoading}>
          Registrarse
        </SubmitButton>

        <FormNavigation 
          mode={navigation.currentMode} 
          onModeChange={navigation.onModeChange} 
        />
      </form>
    </Form>
  );
}