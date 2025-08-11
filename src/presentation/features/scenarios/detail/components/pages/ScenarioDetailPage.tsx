// Atomic Design: Page Template (Scenario Detail)

"use client";

import { GetScenarioDetailResponse } from '@/presentation/features/scenarios/detail/application/GetScenarioDetailUseCase';
import { MainHeader } from "@/shared/components/organisms/main-header";
import { ScenarioDetail } from "@/presentation/features/scenarios/components/organisms/scenario-detail";
import { Badge } from "@/shared/ui/badge";
import { FiChevronLeft, FiGrid, FiTag, FiClock, FiDollarSign, FiUsers } from "react-icons/fi";
import Link from "next/link";

// Template Props (Atomic Design Page Level)
export interface ScenarioDetailPageProps {
  initialData: GetScenarioDetailResponse;
}

// Atomic Design: Scenario Detail Page Template
export function ScenarioDetailPage({ initialData }: ScenarioDetailPageProps) {
  const { scenario, metadata } = initialData;

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      {/* Header Organism */}
      <MainHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb & Header Section */}
        <div className="flex flex-col md:flex-row items-start gap-2 mb-6">
          <div className="flex-1">
            {/* Breadcrumb Navigation */}
            <Link
              href="/"
              className="inline-flex items-center text-teal-600 hover:text-teal-700 text-sm mb-2"
            >
              <FiChevronLeft className="h-4 w-4 mr-1" />
              Volver a todos los escenarios
            </Link>

            {/* Scenario Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-teal-600">
              {scenario.name}
            </h1>

            {/* Enhanced Badge Section with Domain Metadata */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {/* Base scenario badge */}
              <Badge className="flex items-center bg-teal-50 text-teal-700 border-teal-200">
                <FiGrid className="h-4 w-4 mr-1" />
                {scenario.scenario.name}
              </Badge>

              {/* Cost badge with enhanced logic */}
              <Badge className={`flex items-center ${
                metadata.category === 'free' 
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : metadata.category === 'premium'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                <FiDollarSign className="h-4 w-4 mr-1" />
                {metadata.category === 'free' ? 'Gratuito' : 
                 metadata.category === 'premium' ? 'Premium' : 'De pago'}
              </Badge>

              {/* Capacity badge */}
              {scenario.numberOfPlayers > 0 && (
                <Badge className="flex items-center bg-orange-50 text-orange-700 border-orange-200">
                  <FiUsers className="h-4 w-4 mr-1" />
                  {scenario.numberOfPlayers} jugadores
                </Badge>
              )}

              {/* Spectators badge */}
              {metadata.canAccommodateSpectators && (
                <Badge className="flex items-center bg-indigo-50 text-indigo-700 border-indigo-200">
                  <FiUsers className="h-4 w-4 mr-1" />
                  {scenario.numberOfSpectators} espectadores
                </Badge>
              )}

              {/* Reservation required badge */}
              {metadata.requiresReservation && (
                <Badge className="flex items-center bg-yellow-50 text-yellow-700 border-yellow-200">
                  <FiClock className="h-4 w-4 mr-1" />
                  Reserva requerida
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Existing ScenarioDetail Component */}
        <ScenarioDetail 
          subScenario={scenario} 
        />
      </div>
    </main>
  );
}

// Display name for debugging
ScenarioDetailPage.displayName = 'ScenarioDetailPage';
