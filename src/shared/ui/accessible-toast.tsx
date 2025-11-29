// Componente para mejorar accesibilidad de notificaciones

'use client';

import { useEffect, useState } from 'react';

interface AccessibleToast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: string;
}

interface AccessibleToastProviderProps {
  children: React.ReactNode;
}

// Contexto para toasts accesibles
export function AccessibleToastProvider({ children }: AccessibleToastProviderProps) {
  const [toasts, setToasts] = useState<AccessibleToast[]>([]);

  // Auto-clear toasts después de 5 segundos
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts([]);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  // Función global para agregar toasts accesibles
  useEffect(() => {
    const addAccessibleToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
      const newToast: AccessibleToast = {
        id: Date.now().toString(),
        message,
        type,
      };
      
      setToasts(prev => [...prev, newToast]);
    };

    // Registrar función global
    (window as any).addAccessibleToast = addAccessibleToast;

    return () => {
      delete (window as any).addAccessibleToast;
    };
  }, []);

  return (
    <>
      {children}
      
      {/* ARIA-LIVE: Screen readers anunciarán estos mensajes */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only" // Screen reader only
      >
        {toasts.map(toast => (
          <div key={toast.id}>
            {toast.type === 'error' && ''} 
            {toast.type === 'success' && ''}
            {toast.type === 'info' && 'Info: '}
            {toast.message}
          </div>
        ))}
      </div>
      
      {/* ARIA-LIVE ASSERTIVE: Para errores críticos */}
      <div
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {toasts
          .filter(toast => toast.type === 'error')
          .map(toast => (
            <div key={`assertive-${toast.id}`}>
              Error crítico: {toast.message}
            </div>
          ))
        }
      </div>
    </>
  );
}

// Hook para usar toasts accesibles
export const useAccessibleToast = () => {
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (typeof window !== 'undefined' && (window as any).addAccessibleToast) {
      (window as any).addAccessibleToast(message, type);
    }
  };

  return { addToast };
};
