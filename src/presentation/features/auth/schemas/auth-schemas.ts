import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "El correo es requerido").email("Correo inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const registerSchema = z
  .object({
    dni: z.preprocess(
      (v) => Number(v),
      z.number().int().positive({ message: "DNI inválido" }),
    ),
    firstName: z.string().min(1, "El nombre es requerido"),
    lastName: z.string().min(1, "El apellido es requerido"),
    phone: z.string().min(6, "Teléfono inválido"),
    address: z.string().min(1, "La dirección es requerida"),
    email: z.string().min(1, "El correo es requerido").email("Correo inválido"),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .regex(/[A-Z]/, "Debe tener una mayúscula")
      .regex(/[a-z]/, "Debe tener una minúscula")
      .regex(/[0-9]/, "Debe tener un número"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
    roleId: z.number().int().positive({ message: "Selecciona un rol" }),
    neighborhoodId: z
      .number()
      .int()
      .positive({ message: "Selecciona un barrio" }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });

export const resetSchema = z.object({
  email: z.string().min(1, "El correo es requerido").email("Correo inválido"),
});

export type TLoginData = z.infer<typeof loginSchema>;
export type TRegisterData = z.infer<typeof registerSchema>;
export type TResetData = z.infer<typeof resetSchema>;
