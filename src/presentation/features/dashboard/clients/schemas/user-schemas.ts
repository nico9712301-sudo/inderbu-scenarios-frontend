import { z } from 'zod';

// Base user schema with shared validation rules
export const baseUserSchema = z.object({
  dni: z.number()
    .positive('DNI debe ser un número positivo')
    .int('DNI debe ser un número entero')
    .min(1000000, 'DNI debe tener al menos 7 dígitos')
    .max(999999999, 'DNI no puede tener más de 9 dígitos'),
  
  firstName: z.string()
    .min(2, 'Nombre debe tener al menos 2 caracteres')
    .max(50, 'Nombre no puede tener más de 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Nombre solo puede contener letras y espacios'),
  
  lastName: z.string()
    .min(2, 'Apellido debe tener al menos 2 caracteres')
    .max(50, 'Apellido no puede tener más de 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Apellido solo puede contener letras y espacios'),
  
  email: z.string()
    .email('Email debe tener un formato válido')
    .max(100, 'Email no puede tener más de 100 caracteres')
    .toLowerCase(),
  
  phone: z.string()
    .min(8, 'Teléfono debe tener al menos 8 caracteres')
    .max(20, 'Teléfono no puede tener más de 20 caracteres')
    .regex(/^[\d\s\-\+\(\)]+$/, 'Teléfono solo puede contener números y símbolos válidos'),
  
  address: z.string()
    .min(5, 'Dirección debe tener al menos 5 caracteres')
    .max(200, 'Dirección no puede tener más de 200 caracteres'),
  
  roleId: z.number()
    .positive('Rol debe ser seleccionado')
    .int('Rol debe ser un número entero'),
  
  neighborhoodId: z.number()
    .positive('Barrio debe ser seleccionado')
    .int('Barrio debe ser un número entero'),
});

// Create user schema - all fields required
export const createUserSchema = baseUserSchema.extend({
  password: z.string()
    .min(8, 'Contraseña debe tener al menos 8 caracteres')
    .max(50, 'Contraseña no puede tener más de 50 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Contraseña debe contener al menos una minúscula, una mayúscula y un número')
    .optional(),
  
  isActive: z.boolean().default(true),
});

// Update user schema - all fields optional
export const updateUserSchema = baseUserSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Filters schema for search and filtering
export const userFiltersSchema = z.object({
  page: z.number().positive().int().optional(),
  limit: z.number().positive().int().max(100).optional(),
  search: z.string().max(100).optional(),
  roleId: z.number().positive().int().optional(),
  neighborhoodId: z.number().positive().int().optional(),
  isActive: z.boolean().optional(),
});

// Type exports
export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type UserFiltersFormData = z.infer<typeof userFiltersSchema>;

// Validation helper functions
export const validateCreateUser = (data: unknown): CreateUserFormData => {
  return createUserSchema.parse(data);
};

export const validateUpdateUser = (data: unknown): UpdateUserFormData => {
  return updateUserSchema.parse(data);
};

export const validateUserFilters = (data: unknown): UserFiltersFormData => {
  return userFiltersSchema.parse(data);
};

// Form field validation helpers
export const getFieldError = (error: z.ZodError, fieldName: string): string | undefined => {
  const fieldError = error.issues.find(issue => 
    issue.path.includes(fieldName)
  );
  return fieldError?.message;
};

export const getFieldErrors = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  error.issues.forEach(issue => {
    const fieldName = issue.path[0] as string;
    if (fieldName) {
      errors[fieldName] = issue.message;
    }
  });
  return errors;
};