"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { AuthState } from "@/entities/user/model/types";
import { TLoginData, TRegisterData, TResetData } from "../schemas/auth-schemas";
import { login, register, resetPassword, logout } from "../api/auth-actions";

interface AuthContextType extends AuthState {
  // Actions
  login: (credentials: TLoginData) => Promise<void>;
  register: (data: TRegisterData) => Promise<void>;
  resetPassword: (data: TResetData) => Promise<void>;
  logout: () => Promise<void>;

  // Compatibility methods (legacy support)
  validateCurrentSession: () => Promise<boolean>;
  isTokenExpired: () => boolean;
  refreshToken: () => Promise<boolean>;
  authReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const queryClient = useQueryClient();

  // FIX: Initialize auth state from /api/auth/me para evitar flicker
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include", // incluye httpOnly cookies
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data?.user) {
            // FIX: Versión funcional para evitar stale closures
            setAuthState(() => ({
              user: result.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            }));
            return;
          }
        }

        // No autenticado o error
        setAuthState(() => ({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        console.error("Error initializing auth:", error);
        setAuthState(() => ({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: "Error de inicialización",
        }));
      }
    };

    initializeAuth();
  }, []);

  // OPTIMIZADO: Login con useCallback y función directa
  const handleLogin = useCallback(
    async (credentials: TLoginData): Promise<void> => {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        // CORRECTO: Usar función directa (sin FormData)
        const result = await login(credentials);

        if (result.success && result.data) {
          // Server action ya configuró httpOnly cookies + revalidatePath
          // FIX: Versión funcional para evitar stale closures
          setAuthState(() => ({
            user: result.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          }));

          toast.success("¡Bienvenido! Inicio de sesión correcto");

          // NO MÁS router.refresh() - revalidatePath lo maneja automáticamente
        } else {
          throw new Error(result.error || "Error de autenticación");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error de autenticación";
        // FIX: Versión funcional
        setAuthState((prev) => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
        }));
        toast.error(errorMessage);
        throw error;
      }
    },
    []
  );

  // OPTIMIZADO: Register con useCallback y función directa
  const handleRegister = useCallback(
    async (data: TRegisterData): Promise<void> => {
      setAuthState((prev) => ({ ...prev, error: null }));

      try {
        // CORRECTO: Usar función directa (sin FormData)
        const result = await register(data);

        if (result.success) {
          toast.success(
            "Registrado correctamente. Revisa tu correo para confirmar tu cuenta."
          );
        } else {
          throw new Error(result.error || "Error de registro");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error de registro";
        // FIX: Versión funcional
        setAuthState((prev) => ({ ...prev, error: errorMessage }));
        toast.error(errorMessage);
        throw error;
      }
    },
    []
  );

  // OPTIMIZADO: Reset password con useCallback y función directa
  const handleResetPassword = useCallback(
    async (data: TResetData): Promise<void> => {
      setAuthState((prev) => ({ ...prev, error: null }));

      try {
        // CORRECTO: Usar función directa (sin FormData)
        const result = await resetPassword(data);

        if (result.success) {
          toast.success(
            "Correo enviado. Revisa tu bandeja para restablecer tu contraseña."
          );
        } else {
          throw new Error(result.error || "Error al enviar correo");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Error al enviar correo";
        // FIX: Versión funcional
        setAuthState((prev) => ({ ...prev, error: errorMessage }));
        toast.error(errorMessage);
        throw error;
      }
    },
    []
  );

  // OPTIMIZADO: Logout con useCallback y función directa
  const handleLogout = useCallback(async (): Promise<void> => {
    setAuthState((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await logout();

      if (result.success) {
        // Server action ya limpió cookies httpOnly + revalidatePath
        // FIX: Versión funcional para evitar stale closures
        setAuthState(() => ({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        }));

        // INVALIDACIÓN ESPECÍFICA: Solo queries relevantes por userId
        queryClient.invalidateQueries({ queryKey: ["current-user"] });
        queryClient.invalidateQueries({ queryKey: ["reservations"] });

        toast.success("Sesión cerrada correctamente");

        // NO MÁS router.refresh() - revalidatePath lo maneja automáticamente
      } else {
        throw new Error(result.error || "Error al cerrar sesión");
      }
    } catch (error) {
      // Incluso si hay error, limpiar estado local
      setAuthState(() => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }));

      // LIMPIAR solo queries específicas
      queryClient.invalidateQueries({ queryKey: ["current-user"] });

      const errorMessage =
        error instanceof Error ? error.message : "Error al cerrar sesión";
      toast.error(errorMessage);
    }
  }, [queryClient]);

  // Compatibilidad - Session validation (delegado al servidor)
  const validateCurrentSession = useCallback(async (): Promise<boolean> => {
    // Con httpOnly cookies, el servidor maneja la validación automáticamente
    return authState.isAuthenticated;
  }, [authState.isAuthenticated]);

  // Compatibilidad - Token expiration (ya no relevante)
  const checkTokenExpired = useCallback((): boolean => {
    // El servidor maneja expiración automáticamente con httpOnly cookies
    return !authState.isAuthenticated;
  }, [authState.isAuthenticated]);

  // Compatibilidad - Refresh token (automático en servidor)
  const handleRefreshToken = useCallback(async (): Promise<boolean> => {
    // Con httpOnly cookies, el refresh es automático en el servidor
    return authState.isAuthenticated;
  }, [authState.isAuthenticated]);

  // OPTIMIZADO: Context value con callbacks memoizados
  const contextValue: AuthContextType = {
    ...authState,
    // Usar server actions optimizados
    login: handleLogin,
    register: handleRegister,
    resetPassword: handleResetPassword,
    logout: handleLogout,
    refreshToken: handleRefreshToken,
    validateCurrentSession,
    isTokenExpired: checkTokenExpired,
    authReady: !authState.isLoading, // Compatibility alias
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
