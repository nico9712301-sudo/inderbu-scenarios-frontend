'use server';

import { createUserRepository } from '@/infrastructure/repositories/auth-user-repository.adapter';
import { extractUserFromToken } from '@/entities/user/model/types';
import {
  loginSchema,
  registerSchema,
  resetSchema,
  TLoginData,
  TRegisterData,
  TResetData
} from '@/presentation/features/auth/schemas/auth-schemas';
import { ClientHttpClientFactory } from '@/shared/api/http-client-client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';

/**
 * Auth Server Actions
 * 
 * Next.js Server Actions that handle authentication requests.
 * These act as controllers in the Clean Architecture, handling:
 * - Input validation and transformation
 * - Authentication repository orchestration
 * - Error handling
 * - Cookie management (httpOnly security)
 * - Cache invalidation (revalidatePath)
 * - Response formatting
 */

// ARREGLADO: fieldErrors puede ser null o Record limpio
export interface AuthResult {
  success: boolean;
  data?: any;
  error?: string;
  fieldErrors?: Record<string, string[]> | null;
}

const getFieldErrors = (error: z.ZodError): Record<string, string[]> => {
  const flattened = error.flatten().fieldErrors;
  const cleaned: Record<string, string[]> = {};
  
  for (const [key, value] of Object.entries(flattened)) {
    if (value && Array.isArray(value)) {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
};

export async function loginAction(
  _prevState: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  try {
    // VALIDACIÓN: Usar loginSchema de auth-schemas
    const rawData = {
      email: formData.get('email'),
      password: formData.get('password'),
    };
    
    const credentials = loginSchema.parse(rawData);

    // CORRECTO: ClientHttpClientFactory como pide UserRepository
    const httpClient = ClientHttpClientFactory.createClient();
    const repository = createUserRepository(httpClient);

    // Execute login
    const tokens = await repository.login(credentials);

    // Extract user from token
    const user = extractUserFromToken(tokens.access_token);
    if (!user) {
      throw new Error('Invalid token received from server');
    }

    // COOKIES: httpOnly + secure + strict + path
    const cookieStore = await cookies();
    cookieStore.set('auth_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/', // Path específico
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    if (tokens.refresh_token) {
      cookieStore.set('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/', // Path específico
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    console.log(`User logged in successfully: ${user.email}`);

    // REVALIDATE: Auto-actualizar UI
    revalidatePath('/');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: { user }, // Solo user, no tokens
    };
  } catch (error) {
    console.error('Error in login action:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Datos de entrada inválidos',
        fieldErrors: getFieldErrors(error), // LIMPIO: sin undefined
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de autenticación',
    };
  }
}

export async function registerAction(
  _prevState: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  try {
    // VALIDACIÓN: Usar registerSchema de auth-schemas
    const rawData = {
      dni: Number(formData.get('dni')),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      roleId: Number(formData.get('roleId')),
      neighborhoodId: Number(formData.get('neighborhoodId')),
    };

    const registerData = registerSchema.parse(rawData);

    // CORRECTO: ClientHttpClientFactory
    const httpClient = ClientHttpClientFactory.createClient();
    const repository = createUserRepository(httpClient);

    // Execute registration - TIPOS COINCIDEN: TRegisterData
    await repository.register(registerData);

    console.log(`User registered successfully: ${registerData.email}`);

    // REVALIDATE
    revalidatePath('/auth');

    return {
      success: true,
      data: { message: 'Registrado correctamente. Revisa tu correo para confirmar tu cuenta.' },
    };
  } catch (error) {
    console.error('Error in register action:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Datos de entrada inválidos',
        fieldErrors: getFieldErrors(error),
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de registro',
    };
  }
}

export async function resetPasswordAction(
  _prevState: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  try {
    // VALIDACIÓN: Usar resetSchema
    const rawData = {
      email: formData.get('email'),
    };

    const resetData = resetSchema.parse(rawData);

    // CORRECTO: ClientHttpClientFactory
    const httpClient = ClientHttpClientFactory.createClient();
    const repository = createUserRepository(httpClient);

    // Execute reset password - TIPOS COINCIDEN: TResetData
    await repository.resetPassword(resetData);

    console.log(`Password reset sent for: ${resetData.email}`);

    return {
      success: true,
      data: { message: 'Correo enviado. Revisa tu bandeja para restablecer tu contraseña.' },
    };
  } catch (error) {
    console.error('Error in reset password action:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Datos de entrada inválidos',
        fieldErrors: getFieldErrors(error),
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al enviar correo de restablecimiento',
    };
  }
}

export async function logoutAction(): Promise<AuthResult> {
  try {
    // Try to call logout endpoint
    try {
      const httpClient = ClientHttpClientFactory.createClient();
      const repository = createUserRepository(httpClient);

      await repository.logout();
    } catch (error) {
      console.warn('Error calling logout endpoint:', error);
      // Continue with local logout even if server call fails
    }

    // Clear server-side cookies
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    cookieStore.delete('refresh_token');

    console.log('User logged out successfully');

    // REVALIDATE
    revalidatePath('/');
    revalidatePath('/auth');

    return {
      success: true,
      data: { message: 'Sesión cerrada correctamente' },
    };
  } catch (error) {
    console.error('Error in logout action:', error);

    return {
      success: false,
      error: 'Error al cerrar sesión',
    };
  }
}

// FUNCIÓN DIRECTA: Sin FormData, para uso programático
export async function login(credentials: TLoginData): Promise<AuthResult> {
  try {
    const validatedCredentials = loginSchema.parse(credentials);

    const httpClient = ClientHttpClientFactory.createClient();
    const repository = createUserRepository(httpClient);

    const tokens = await repository.login(validatedCredentials);
    const user = extractUserFromToken(tokens.access_token);

    if (!user) {
      throw new Error('Invalid token received from server');
    }

    // Set cookies con máxima seguridad
    const cookieStore = await cookies();
    cookieStore.set('auth_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/', // Path específico
      maxAge: 60 * 60 * 24 * 7,
    });

    if (tokens.refresh_token) {
      cookieStore.set('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/', // Path específico
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    // REVALIDATE
    revalidatePath('/');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: { user },
    };
  } catch (error) {
    console.error('Error in direct login:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Datos de entrada inválidos',
        fieldErrors: getFieldErrors(error),
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de autenticación',
    };
  }
}

// FUNCIÓN DIRECTA: Register sin FormData
export async function register(data: TRegisterData): Promise<AuthResult> {
  try {
    const validatedData = registerSchema.parse(data);

    const httpClient = ClientHttpClientFactory.createClient();
    const repository = createUserRepository(httpClient);

    await repository.register(validatedData);

    console.log(`User registered successfully: ${validatedData.email}`);

    revalidatePath('/auth');

    return {
      success: true,
      data: { message: 'Registrado correctamente. Revisa tu correo para confirmar tu cuenta.' },
    };
  } catch (error) {
    console.error('Error in direct register:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Datos de entrada inválidos',
        fieldErrors: getFieldErrors(error),
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de registro',
    };
  }
}

// FUNCIÓN DIRECTA: Reset password sin FormData
export async function resetPassword(data: TResetData): Promise<AuthResult> {
  try {
    const validatedData = resetSchema.parse(data);

    const httpClient = ClientHttpClientFactory.createClient();
    const repository = createUserRepository(httpClient);

    await repository.resetPassword(validatedData);

    console.log(`Password reset sent for: ${validatedData.email}`);

    return {
      success: true,
      data: { message: 'Correo enviado. Revisa tu bandeja para restablecer tu contraseña.' },
    };
  } catch (error) {
    console.error('Error in direct reset password:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Datos de entrada inválidos',
        fieldErrors: getFieldErrors(error),
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al enviar correo de restablecimiento',
    };
  }
}

// FUNCIÓN DIRECTA: Logout
export async function logout(): Promise<AuthResult> {
  return logoutAction(); // Reutilizar la action ya que no necesita FormData
}