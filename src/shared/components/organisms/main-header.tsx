"use client";

import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { BookIcon, LogOut, Menu, Settings, User, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { PermissionGuard } from "../molecules/permission-guard";
import { useAuth } from "@/presentation/features/auth";
import { AuthModal } from "@/presentation/features/auth/components/organisms/auth-modal";
// import { AuthModal } from "@/presentation/features/auth/components";
// import { AuthModal } from "@/presentation/features/auth"; // AuthModal not implemented yet


export function MainHeader() {
  const { user, logout, isAuthenticated, authReady } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLoginSuccess = () => {
    setModalOpen(false); // Solo cerrar modal - el login ya se manejó internamente
  };

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Mostrar loading mientras se inicializa la autenticación
  if (!authReady) {
    return (
      <header className="sticky top-0 z-50 shadow-sm">
        <div className="bg-blue-600 text-white">
          <div className="container mx-auto px-4 flex items-center justify-between py-2">
            <div className="h-5 w-24 bg-blue-500 rounded animate-pulse"></div>
            <div className="h-5 w-32 bg-blue-500 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 flex items-center justify-between py-4">
            <div className="h-16 w-64 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* Top bar with gov.co - fondo azul */}
      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 flex items-center justify-between py-2">
          <Link
            href="https://www.gov.co"
            target="_blank"
            className="opacity-90 hover:opacity-100 transition-opacity"
          >
            <Image
              src="https://inderbu.gov.co/wp-content/uploads/2022/09/logo_gov_co.png"
              alt="gov.co"
              width={100}
              height={30}
              className="h-5 w-auto"
            />
          </Link>

          {/* Admin Panel Access */}
          <PermissionGuard requiredPermission="canViewAdminPanel">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-white hover:text-blue-200 text-sm transition-colors"
            >
              <Settings className="w-4 h-4" />
              Panel de Control
            </Link>
          </PermissionGuard>
        </div>
      </div>

      {/* Main navigation*/}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 flex items-center justify-between py-4">
          <Link href="/" className="flex items-center">
            <Image
              src="https://inderbu.gov.co/wp-content/uploads/2024/07/LOGO-3.png"
              alt="INDERBU"
              width={280}
              height={65}
              className="h-16 w-auto"
            />
          </Link>

          {/* Actions - Login y Reservas */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Mis Reservas Button */}
                <PermissionGuard requiredPermission="canViewReservations">
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden md:flex items-center gap-2 border-blue-200 text-blue-700 
                             hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                    asChild
                  >
                    <Link href={`/reservations/${user?.id}`}>
                      <BookIcon className="w-4 h-4" />
                      <span>Mis Reservas</span>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full ml-1"></div>
                    </Link>
                  </Button>
                </PermissionGuard>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-2 text-gray-700 hover:text-blue-600 
                               hover:bg-blue-50 transition-all duration-200 rounded-lg px-3"
                    >
                      <div
                        className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 
                                  rounded-full flex items-center justify-center text-white text-sm font-medium"
                      >
                        {user?.email?.[0]?.toUpperCase()}
                      </div>
                      <span className="hidden md:block text-sm font-medium max-w-32 truncate">
                        {user?.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-white text-black shadow-lg border border-gray-200 rounded-lg"
                  >
                    {/* User Info */}
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.email}
                      </p>
                      <p className="text-xs text-gray-500">Cuenta activa</p>
                    </div>

                    {/* Reservations - Mobile only */}
                    <PermissionGuard requiredPermission="canViewReservations">
                      <Link
                        href={`/reservations/${user?.id}`}
                        className="md:hidden"
                      >
                        <DropdownMenuItem className="cursor-pointer hover:bg-blue-50 text-blue-600">
                          <BookIcon className="mr-2 h-4 w-4" />
                          Mis Reservas
                        </DropdownMenuItem>
                      </Link>
                    </PermissionGuard>

                    {/* Dashboard Access */}
                    <PermissionGuard requiredPermission="canViewAdminPanel">
                      <Link href="/dashboard">
                        <DropdownMenuItem className="cursor-pointer hover:bg-purple-50 text-purple-600">
                          <Settings className="mr-2 h-4 w-4" />
                          Panel de Control
                        </DropdownMenuItem>
                      </Link>
                    </PermissionGuard>

                    {/* Logout */}
                    <DropdownMenuItem
                      onClick={logout}
                      className="cursor-pointer text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                variant="outline"
                className="bg-white text-blue-600 hover:bg-blue-50 border-blue-200 
                         hover:border-blue-300 transition-all duration-200 shadow-sm"
                onClick={handleOpenModal}
              >
                <User className="w-4 h-4 mr-2" />
                <span>Iniciar Sesión</span>
              </Button>
            )}

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden ml-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="container mx-auto px-4 py-4 space-y-3">
              {!isAuthenticated ? (
                <Button
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => {
                    /* TODO: Implement login modal */
                    setIsMenuOpen(false);
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </Button>
              ) : (
                <>
                  {/* Mobile Reservations */}
                  <PermissionGuard requiredPermission="canViewReservations">
                    <Button
                      variant="outline"
                      className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                      asChild
                    >
                      <Link
                        href={`/reservations/${user?.id}`}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <BookIcon className="w-4 h-4 mr-2" />
                        Mis Reservas
                      </Link>
                    </Button>
                  </PermissionGuard>

                  {/* Mobile Dashboard */}
                  <PermissionGuard requiredPermission="canViewAdminPanel">
                    <Button
                      variant="outline"
                      className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                      asChild
                    >
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Panel de Control
                      </Link>
                    </Button>
                  </PermissionGuard>

                  {/* Logout */}
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal para Login / Register / Reset */}
      <AuthModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </header>
  );
}
