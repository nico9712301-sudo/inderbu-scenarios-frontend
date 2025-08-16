'use client';

import { AuthModal } from '@/presentation/features/auth/components/organisms/auth-modal';
import { useAuth } from '@/presentation/features/auth/model/use-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';



export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(true);
  
  const redirectTo = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, redirectTo]);

  const handleLoginSuccess = () => {
    setIsModalOpen(false);
    router.push(redirectTo);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl mb-4">Ya estás autenticado</h1>
          <p>Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Iniciar Sesión</h1>
          <p className="text-gray-600">Accede a tu cuenta para continuar</p>
        </div>
        
        <AuthModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onLoginSuccess={handleLoginSuccess}
        />
      </div>
    </div>
  );
}
