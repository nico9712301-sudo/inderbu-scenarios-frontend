"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { AuthFormField } from "@/shared/ui/auth-form-field";
import { PasswordInput } from "@/shared/ui/password-input";
import { SubmitButton } from "@/shared/ui/submit-button";
import { FormNavigation } from "../molecules/form-navigation";
import { loginSchema, TLoginData } from "../../schemas/auth-schemas";
import { IFormHandler } from "../../interfaces/form-handler.interface";
import { IFormNavigation } from "../../interfaces/form-navigation.interface";

interface LoginFormProps {
  onSubmit: IFormHandler<TLoginData>["onSubmit"];
  isLoading: boolean;
  navigation: IFormNavigation;
}

export function LoginForm({ onSubmit, isLoading, navigation }: LoginFormProps) {
  const form = useForm<TLoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // FIX: Usar form.handleSubmit directo para mejor manejo de errores
  // FIX: Usar isSubmitting local para evitar re-renders innecesarios
  const { isSubmitting } = form.formState;
  const loading = isLoading || isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <AuthFormField 
          label="Correo electrónico" 
          error={form.formState.errors.email?.message}
          required
        >
          <Input
            {...form.register("email")}
            type="email"
            placeholder="ejemplo@correo.com"
            disabled={loading}
          />
        </AuthFormField>

        <AuthFormField 
          label="Contraseña" 
          error={form.formState.errors.password?.message}
          required
        >
          <PasswordInput
            {...form.register("password")}
            placeholder="••••••••"
            disabled={loading}
          />
        </AuthFormField>

        <FormNavigation 
          mode={navigation.currentMode} 
          onModeChange={navigation.onModeChange} 
        />

        <SubmitButton isLoading={loading}>
          Iniciar sesión
        </SubmitButton>
      </form>
    </Form>
  );
}
