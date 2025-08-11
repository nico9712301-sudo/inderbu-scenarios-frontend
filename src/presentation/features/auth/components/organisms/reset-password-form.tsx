"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { AuthFormField } from "@/shared/ui/auth-form-field";
import { SubmitButton } from "@/shared/ui/submit-button";
import { FormNavigation } from "../molecules/form-navigation";
import { resetSchema, TResetData } from "../../schemas/auth-schemas";
import { IFormHandler } from "../../interfaces/form-handler.interface";
import { IFormNavigation } from "../../interfaces/form-navigation.interface";

interface ResetPasswordFormProps {
  onSubmit: IFormHandler<TResetData>["onSubmit"];
  isLoading: boolean;
  navigation: IFormNavigation;
}

export function ResetPasswordForm({ onSubmit, isLoading, navigation }: ResetPasswordFormProps) {
  const form = useForm<TResetData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthFormField 
          label="Correo electrónico" 
          error={form.formState.errors.email?.message}
          required
        >
          <Input
            {...form.register("email")}
            type="email"
            placeholder="tu@correo.com"
            disabled={isLoading}
          />
        </AuthFormField>

        <FormNavigation 
          mode={navigation.currentMode} 
          onModeChange={navigation.onModeChange} 
        />

        <SubmitButton isLoading={isLoading}>
          Enviar enlace
        </SubmitButton>
      </form>
    </Form>
  );
}
